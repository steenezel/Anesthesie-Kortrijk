import type { Express } from "express";
import { type Server } from "http";
import { db } from "./db.js";
import { DEFAULT_LOGBOOK_USERS, type SeedUser } from "./logbook-users.js";
import {
  marketplace,
  insertMarketplaceSchema,
  users,
  logbookEntries,
  insertLogbookEntrySchema,
  spinalLogs,
  insertSpinalLogSchema,
  gameHighscores,
  gameStats,
  type UserRole,
} from "../shared/schema.js";
import { sql, eq, and, desc, gte, lte, isNotNull, inArray, type SQL } from "drizzle-orm";

function useDb() {
  if (!db) {
    const err: Error & { status?: number } = new Error(
      "DATABASE_URL is niet ingesteld. Zie HANDLEIDING.md.",
    );
    err.status = 503;
    throw err;
  }
  return db;
}

function toPublicUser(
  user: { id: string; username: string; name: string | null; role: UserRole | null | undefined },
  seed?: SeedUser,
) {
  return {
    id: user.id,
    username: user.username,
    name: user.name ?? user.username,
    role: (user.role ?? "aso") as UserRole,
    hidden: Boolean(seed && "hidden" in seed && seed.hidden),
  };
}

function todayIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function headerValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function credentialsFromRequest(req: {
  headers: Record<string, string | string[] | undefined>;
  body?: { userId?: string; pin?: string };
  query?: { userId?: string; pin?: string };
}) {
  const userId =
    headerValue(req.headers["x-logbook-user-id"]) ||
    String(req.body?.userId || req.query?.userId || "");
  const pin =
    headerValue(req.headers["x-logbook-pin"]) ||
    String(req.body?.pin || req.query?.pin || "");
  return { userId, pin };
}

async function authenticateLogbookUser(userId: string, pin: string) {
  if (!userId || !pin) return null;

  const found = await useDb().select().from(users).where(eq(users.id, userId)).limit(1);
  const user = found[0];
  const expectedPin = user?.pin || user?.password;
  if (!user || expectedPin !== pin) return null;

  return toPublicUser(user);
}

async function ensureLogbookUsers() {
  for (const seed of DEFAULT_LOGBOOK_USERS) {
    try {
      const existing = await useDb()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, seed.username))
        .limit(1);

      if (existing.length === 0) {
        await useDb().insert(users).values({
          username: seed.username,
          name: seed.name,
          role: seed.role,
          pin: seed.pin,
          password: seed.pin,
        });
      } else {
        await useDb()
          .update(users)
          .set({
            name: seed.name,
            role: seed.role,
            pin: seed.pin,
            password: seed.pin,
          })
          .where(eq(users.username, seed.username));
      }
    } catch (error) {
      console.error(`Logbook seed failed for ${seed.username}:`, error);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- NIEUW: MARKTPLAATS ROUTES ---
app.get("/api/marketplace", async (_req, res) => {
  try {
    // Haal voor nu even ALLES op om te zien of de verbinding werkt
    const results = await useDb().select().from(marketplace).orderBy(marketplace.date);
    console.log("API Verzending naar client:", results);
    res.json(results || []);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database onbereikbaar" });
  }
});

  app.post("/api/marketplace", async (req, res) => {
    try {
      const validatedData = insertMarketplaceSchema.parse(req.body);
      const result = await useDb().insert(marketplace).values(validatedData).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).send("Ongeldige data");
    }
  });

app.delete("/api/marketplace/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await useDb().delete(marketplace).where(sql`${marketplace.id} = ${id}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).send("Kon niet verwijderen");
  }
});

  // --- EINDE MARKTPLAATS ROUTES ---

  // --- ASO LOGBOEK ---
  app.post("/api/logbook/auth/login", async (req, res) => {
    try {
      await ensureLogbookUsers();
      const { username, userId, pin } = req.body as {
        username?: string;
        userId?: string;
        pin?: string;
      };

      if (!pin || (!username && !userId)) {
        return res.status(400).json({ error: "Gebruikersnaam en PIN vereist" });
      }

      const found = userId
        ? await useDb().select().from(users).where(eq(users.id, userId)).limit(1)
        : await useDb().select().from(users).where(eq(users.username, username!)).limit(1);

      const user = found[0];
      const expectedPin = user?.pin || user?.password;
      if (!user || expectedPin !== pin) {
        return res.status(401).json({ error: "Ongeldige PIN" });
      }

      res.json(toPublicUser(user));
    } catch (error) {
      console.error("Logbook login error:", error);
      res.status(500).json({ error: "Login mislukt" });
    }
  });

  app.post("/api/logbook/entries", async (req, res) => {
    try {
      const validated = insertLogbookEntrySchema.parse(req.body);
      const result = await useDb()
        .insert(logbookEntries)
        .values({
          userId: validated.userId,
          category: validated.category,
          subCategory: validated.subCategory,
          technique: validated.technique,
          status: validated.status,
          date: validated.date || todayIsoDate(),
          supervisionLevel: validated.supervisionLevel || null,
          supervisorName: validated.supervisorName || null,
          notes: validated.notes?.trim() || null,
        })
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Logbook insert error:", error);
      res.status(400).json({ error: "Ongeldige data" });
    }
  });

  app.get("/api/logbook/my-entries", async (req, res) => {
    try {
      const userId = String(req.query.userId || "");
      if (!userId) {
        return res.status(400).json({ error: "userId vereist" });
      }

      const entries = await useDb()
        .select()
        .from(logbookEntries)
        .where(eq(logbookEntries.userId, userId))
        .orderBy(desc(logbookEntries.date), desc(logbookEntries.createdAt));

      res.json(entries);
    } catch (error) {
      console.error("Logbook my-entries error:", error);
      res.status(500).json({ error: "Kon logboek niet ophalen" });
    }
  });

  app.get("/api/logbook/supervisor/all", async (req, res) => {
    try {
      const asoId = req.query.asoId ? String(req.query.asoId) : "";
      const category = req.query.category ? String(req.query.category) : "";
      const subCategory = req.query.subCategory ? String(req.query.subCategory) : "";
      const technique = req.query.technique ? String(req.query.technique) : "";
      const startDate = req.query.startDate ? String(req.query.startDate) : "";
      const endDate = req.query.endDate ? String(req.query.endDate) : "";

      const filters: SQL[] = [];
      if (asoId) filters.push(eq(logbookEntries.userId, asoId));
      if (category) filters.push(eq(logbookEntries.category, category));
      if (subCategory) filters.push(eq(logbookEntries.subCategory, subCategory));
      if (technique) filters.push(eq(logbookEntries.technique, technique));
      if (startDate) filters.push(gte(logbookEntries.date, startDate));
      if (endDate) filters.push(lte(logbookEntries.date, endDate));

      const query = useDb()
        .select({
          id: logbookEntries.id,
          userId: logbookEntries.userId,
          asoName: users.name,
          asoUsername: users.username,
          category: logbookEntries.category,
          subCategory: logbookEntries.subCategory,
          technique: logbookEntries.technique,
          status: logbookEntries.status,
          date: logbookEntries.date,
          supervisionLevel: logbookEntries.supervisionLevel,
          supervisorName: logbookEntries.supervisorName,
          notes: logbookEntries.notes,
          createdAt: logbookEntries.createdAt,
        })
        .from(logbookEntries)
        .leftJoin(users, eq(logbookEntries.userId, users.id));

      const entries = filters.length
        ? await query.where(and(...filters)).orderBy(desc(logbookEntries.date), desc(logbookEntries.createdAt))
        : await query.orderBy(desc(logbookEntries.date), desc(logbookEntries.createdAt));

      res.json(entries);
    } catch (error) {
      console.error("Logbook supervisor error:", error);
      res.status(500).json({ error: "Kon overzicht niet ophalen" });
    }
  });

  app.get("/api/logbook/users", async (req, res) => {
    try {
      await ensureLogbookUsers();
      const role = req.query.role ? String(req.query.role) : "";

      // Alleen accounts uit DEFAULT_LOGBOOK_USERS (niet elke oude rij in de DB)
      const seedByUsername = new Map<string, SeedUser>(
        DEFAULT_LOGBOOK_USERS.map((seed) => [seed.username, seed]),
      );
      const allowedUsernames: string[] = DEFAULT_LOGBOOK_USERS.map((seed) => seed.username);

      const filters: SQL[] = [
        isNotNull(users.name),
        inArray(users.username, allowedUsernames),
      ];
      if (role === "aso" || role === "supervisor") {
        filters.push(eq(users.role, role as UserRole));
      }

      const rows = await useDb()
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          role: users.role,
        })
        .from(users)
        .where(and(...filters))
        .orderBy(users.name);

      const published = rows
        .map((row) => toPublicUser(row, seedByUsername.get(row.username)))
        .sort((a, b) => Number(a.hidden) - Number(b.hidden) || a.name.localeCompare(b.name, "nl"));

      res.json(published);
    } catch (error) {
      console.error("Logbook users error:", error);
      res.status(500).json({ error: "Kon gebruikers niet ophalen" });
    }
  });

  // --- EINDE ASO LOGBOEK ---

  // --- SCANDICAINE SPINALE LOGBOEK ---
  app.get("/api/spinal-logs", async (req, res) => {
    try {
      const { userId, pin } = credentialsFromRequest(req);
      const user = await authenticateLogbookUser(userId, pin);
      if (!user) {
        return res.status(401).json({ error: "Authenticatie vereist" });
      }

      const rows = await useDb()
        .select()
        .from(spinalLogs)
        .orderBy(desc(spinalLogs.createdAt));

      res.json(rows);
    } catch (error) {
      console.error("Spinal logs fetch error:", error);
      res.status(500).json({ error: "Kon logboek niet ophalen" });
    }
  });

  app.post("/api/spinal-logs", async (req, res) => {
    try {
      const { userId, pin } = credentialsFromRequest(req);
      const user = await authenticateLogbookUser(userId, pin);
      if (!user) {
        return res.status(401).json({ error: "Authenticatie vereist" });
      }

      const body = { ...(req.body ?? {}) } as Record<string, unknown>;
      delete body.userId;
      delete body.pin;
      const validated = insertSpinalLogSchema.parse(body);
      const result = await useDb().insert(spinalLogs).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Spinal log insert error:", error);
      if (error && typeof error === "object" && "issues" in error) {
        const issues = (error as { issues: { path: (string | number)[]; message: string }[] }).issues;
        return res.status(400).json({
          error: "Ongeldige data",
          details: issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
        });
      }
      res.status(400).json({ error: "Ongeldige data" });
    }
  });

  // --- EINDE SCANDICAINE SPINALE LOGBOEK ---

  // --- FLAPPY HIGHSCORES (Postgres / Supabase) ---
  app.post("/api/highscores", async (req, res) => {
    try {
      const { name, score } = req.body;
      const numericScore = Number(score);

      if (!name || isNaN(numericScore)) {
        return res.status(400).send("Ongeldige data");
      }

      const cleanName = name.trim().toUpperCase();
      const database = useDb();
      const existing = await database
        .select()
        .from(gameHighscores)
        .where(eq(gameHighscores.name, cleanName))
        .limit(1);
      const existingScore = existing[0]?.score ?? -1;

      if (numericScore > existingScore) {
        await database
          .insert(gameHighscores)
          .values({ name: cleanName, score: numericScore, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: gameHighscores.name,
            set: { score: numericScore, updatedAt: new Date() },
          });
        res.json({ success: true, updated: true });
      } else {
        res.json({ success: true, updated: false });
      }
    } catch (error) {
      console.error("Fout bij opslaan score:", error);
      const status = (error as { status?: number })?.status || 500;
      res.status(status).send(status === 503 ? "Database niet geconfigureerd" : "Database fout");
    }
  });

  app.get("/api/highscores", async (_req, res) => {
    try {
      const rows = await useDb()
        .select()
        .from(gameHighscores)
        .orderBy(desc(gameHighscores.score))
        .limit(10);
      res.json(rows.map((row) => ({ member: row.name, score: row.score })));
    } catch (error) {
      const status = (error as { status?: number })?.status || 500;
      res.status(status).send(status === 503 ? "Database niet geconfigureerd" : "Database onbereikbaar");
    }
  });

  app.post("/api/game-stats/increment", async (_req, res) => {
    try {
      const key = "global_bird_attempts";
      const database = useDb();
      await database
        .insert(gameStats)
        .values({ key, value: 1 })
        .onConflictDoUpdate({
          target: gameStats.key,
          set: { value: sql`${gameStats.value} + 1` },
        });
      const rows = await database.select().from(gameStats).where(eq(gameStats.key, key)).limit(1);
      res.json({ totalAttempts: rows[0]?.value ?? 1 });
    } catch (error) {
      const status = (error as { status?: number })?.status || 500;
      res.status(status).send("Counter error");
    }
  });

  app.get("/api/game-stats", async (_req, res) => {
    try {
      const rows = await useDb()
        .select()
        .from(gameStats)
        .where(eq(gameStats.key, "global_bird_attempts"))
        .limit(1);
      res.json({ totalAttempts: rows[0]?.value ?? 0 });
    } catch (error) {
      const status = (error as { status?: number })?.status || 500;
      res.status(status).send("Counter error");
    }
  });

  return httpServer;
}

