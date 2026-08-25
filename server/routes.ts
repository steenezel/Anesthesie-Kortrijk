import type { Express } from "express";
import { type Server } from "http";
import Redis from "ioredis";
import { db } from "./db.js"; // Dit verwijst naar je database connectie bestand
import {
  marketplace,
  insertMarketplaceSchema,
  users,
  logbookEntries,
  insertLogbookEntrySchema,
  spinalLogs,
  insertSpinalLogSchema,
  type UserRole,
} from "../shared/schema.js";
import { sql, eq, and, desc, gte, lte, isNotNull, inArray, type SQL } from "drizzle-orm";

/** Bron van waarheid voor de zichtbare ASO-/supervisorlijst.
 *  Alleen deze usernames verschijnen in de app. Verwijder hier = verdwijnt uit de lijst.
 *  Zet `hidden: true` voor testaccounts (onderaan, gedempt). */
const DEFAULT_LOGBOOK_USERS = [
  { username: "emma", name: "Emma Collin", role: "aso" as const, pin: "5758" },
  { username: "sanne", name: "Sanne Decorte", role: "aso" as const, pin: "6140" },
  { username: "magnus", name: "Magnus Van Kerckhove", role: "aso" as const, pin: "2277" },
  { username: "staf", name: "Supervisor Staf", role: "supervisor" as const, pin: "6666" },
  { username: "test", name: "Test Gebruiker", role: "aso" as const, pin: "0000", hidden: true },
] as const;

type SeedUser = (typeof DEFAULT_LOGBOOK_USERS)[number];

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

  const found = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = found[0];
  const expectedPin = user?.pin || user?.password;
  if (!user || expectedPin !== pin) return null;

  return toPublicUser(user);
}

async function ensureLogbookUsers() {
  for (const seed of DEFAULT_LOGBOOK_USERS) {
    try {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, seed.username))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(users).values({
          username: seed.username,
          name: seed.name,
          role: seed.role,
          pin: seed.pin,
          password: seed.pin,
        });
      } else {
        await db
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
  
  const redis = new Redis(process.env.REDIS_URL || "");
  redis.on("error", (err) => {
    console.error("Redis Runtime Error:", err);
  });

  // --- NIEUW: MARKTPLAATS ROUTES ---
app.get("/api/marketplace", async (_req, res) => {
  try {
    // Haal voor nu even ALLES op om te zien of de verbinding werkt
    const results = await db.select().from(marketplace).orderBy(marketplace.date);
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
      const result = await db.insert(marketplace).values(validatedData).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).send("Ongeldige data");
    }
  });

app.delete("/api/marketplace/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(marketplace).where(sql`${marketplace.id} = ${id}`);
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
        ? await db.select().from(users).where(eq(users.id, userId)).limit(1)
        : await db.select().from(users).where(eq(users.username, username!)).limit(1);

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
      const result = await db
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

      const entries = await db
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

      const query = db
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

      const rows = await db
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

      const rows = await db
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
      const result = await db.insert(spinalLogs).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Spinal log insert error:", error);
      res.status(400).json({ error: "Ongeldige data" });
    }
  });

  // --- EINDE SCANDICAINE SPINALE LOGBOEK ---

 // 2. SCORE OPSLAAN
app.post("/api/highscores", async (req, res) => {
  try {
    const { name, score } = req.body;
    const numericScore = Number(score);

    if (!name || isNaN(numericScore)) {
      return res.status(400).send("Ongeldige data");
    }

    const cleanName = name.trim().toUpperCase();
    
    // 1. Haal eerst de bestaande score op van deze persoon
    const existingScoreRaw = await redis.zscore("flappy_anesthetist", cleanName);
    const existingScore = existingScoreRaw ? parseInt(existingScoreRaw, 10) : -1;

    // 2. Alleen opslaan als de nieuwe score ECHT hoger is (of als er nog geen score was)
    if (numericScore > existingScore) {
      await redis.zadd("flappy_anesthetist", numericScore, cleanName);
      res.json({ success: true, updated: true });
    } else {
      res.json({ success: true, updated: false });
    }

  } catch (error) {
    console.error("Fout bij opslaan score:", error);
    res.status(500).send("Database fout");
  }
});

  // 3. TOP 10 OPHALEN
  app.get("/api/highscores", async (_req, res) => {
    try {
      // 'REV' voor hoogste eerst, 'WITHSCORES' om ook de punten te krijgen
      const rawData = await redis.zrevrange("flappy_anesthetist", 0, 9, "WITHSCORES");
      
      // ioredis geeft een vlakke array [name1, score1, name2, score2] terug
      // We vormen dit om naar het formaat dat onze frontend verwacht
      const scores = [];
      for (let i = 0; i < rawData.length; i += 2) {
        scores.push({ member: rawData[i], score: parseInt(rawData[i+1], 10) });
      }
      res.json(scores);
    } catch (error) {
      res.status(500).send("Database onbereikbaar");
    }
  });

  // 4. GLOBAL COUNTER: OPHOGEN
  app.post("/api/game-stats/increment", async (_req, res) => {
    try {
      const totalAttempts = await redis.incr("global_bird_attempts");
      res.json({ totalAttempts });
    } catch (error) {
      res.status(500).send("Counter error");
    }
  });

  // 5. GLOBAL COUNTER: OPHALEN
  app.get("/api/game-stats", async (_req, res) => {
    try {
      const totalAttempts = await redis.get("global_bird_attempts");
      res.json({ totalAttempts: parseInt(totalAttempts || "0") });
    } catch (error) {
      res.status(500).send("Counter error");
    }
  });

  return httpServer;
}

