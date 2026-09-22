import type { Express, Request, Response } from "express";
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
  userPreferences,
  quizProgress,
  type UserRole,
} from "../shared/schema.js";
import { sql, eq, and, desc, gte, lte, isNotNull, inArray, type SQL } from "drizzle-orm";
import {
  requireAuth,
  rejectKioskWrites,
  resolveSessionUser,
  toPublicProfile,
} from "./auth-middleware.js";
import {
  canReviewAsoLogbooks,
  canWriteLogbook,
} from "../shared/permissions.js";

function getDb() {
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
  user: { id: string; username: string; name: string | null; role: UserRole | null | undefined; email?: string | null },
  seed?: SeedUser,
) {
  return {
    id: user.id,
    username: user.username,
    name: user.name ?? user.username,
    email: user.email ?? null,
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

/** SM-2 inspired update for quiz SRS. quality: 0 fail … 5 easy */
function applySm2(
  prev: { easeFactor: number; intervalDays: number; repetitions: number },
  quality: number,
) {
  let { easeFactor, intervalDays, repetitions } = prev;
  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    repetitions += 1;
  }
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + Math.max(1, intervalDays));
  return { easeFactor, intervalDays, repetitions, dueAt };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- SESSION / ME ---
  app.get("/api/me", async (req, res) => {
    try {
      const sessionUser = await resolveSessionUser(req);
      if (!sessionUser) {
        return res.status(401).json({ error: "Niet ingelogd" });
      }
      return res.json({ user: toPublicProfile(sessionUser.profile) });
    } catch (error) {
      console.error("/api/me error:", error);
      return res.status(500).json({ error: "Sessie ophalen mislukt" });
    }
  });

  // --- PREFERENCES ---
  app.get("/api/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.appUser!.profile.id;
      const rows = await getDb()
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);
      res.json({ prefs: rows[0]?.prefs ?? {} });
    } catch (error) {
      console.error("preferences get:", error);
      res.status(500).json({ error: "Voorkeuren ophalen mislukt" });
    }
  });

  app.put("/api/preferences", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const userId = req.appUser!.profile.id;
      const prefs =
        req.body && typeof req.body === "object" && "prefs" in req.body
          ? (req.body as { prefs: Record<string, unknown> }).prefs
          : (req.body as Record<string, unknown>);

      const [row] = await getDb()
        .insert(userPreferences)
        .values({ userId, prefs, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: { prefs, updatedAt: new Date() },
        })
        .returning();
      res.json({ prefs: row.prefs });
    } catch (error) {
      console.error("preferences put:", error);
      res.status(500).json({ error: "Voorkeuren opslaan mislukt" });
    }
  });

  // --- QUIZ SRS ---
  app.get("/api/quiz/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.appUser!.profile.id;
      const rows = await getDb()
        .select()
        .from(quizProgress)
        .where(eq(quizProgress.userId, userId));
      res.json(rows);
    } catch (error) {
      console.error("quiz progress get:", error);
      res.status(500).json({ error: "Quiz progress ophalen mislukt" });
    }
  });

  app.post("/api/quiz/progress", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const userId = req.appUser!.profile.id;
      const questionId = String((req.body as { questionId?: string })?.questionId || "");
      const correct = Boolean((req.body as { correct?: boolean })?.correct);
      if (!questionId) {
        return res.status(400).json({ error: "questionId vereist" });
      }

      const existing = await getDb()
        .select()
        .from(quizProgress)
        .where(and(eq(quizProgress.userId, userId), eq(quizProgress.questionId, questionId)))
        .limit(1);

      const quality = correct ? 4 : 1;
      const prev = existing[0]
        ? {
            easeFactor: existing[0].easeFactor,
            intervalDays: existing[0].intervalDays,
            repetitions: existing[0].repetitions,
          }
        : { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
      const next = applySm2(prev, quality);

      if (existing[0]) {
        const [row] = await getDb()
          .update(quizProgress)
          .set({
            easeFactor: next.easeFactor,
            intervalDays: next.intervalDays,
            repetitions: next.repetitions,
            dueAt: next.dueAt,
            lastResult: correct ? "correct" : "incorrect",
            updatedAt: new Date(),
          })
          .where(eq(quizProgress.id, existing[0].id))
          .returning();
        return res.json(row);
      }

      const [row] = await getDb()
        .insert(quizProgress)
        .values({
          userId,
          questionId,
          easeFactor: next.easeFactor,
          intervalDays: next.intervalDays,
          repetitions: next.repetitions,
          dueAt: next.dueAt,
          lastResult: correct ? "correct" : "incorrect",
        })
        .returning();
      res.json(row);
    } catch (error) {
      console.error("quiz progress post:", error);
      res.status(500).json({ error: "Quiz progress opslaan mislukt" });
    }
  });

  // --- MARKTPLAATS ---
  app.get("/api/marketplace", requireAuth, async (_req, res) => {
    try {
      const results = await getDb().select().from(marketplace).orderBy(marketplace.date);
      res.json(results || []);
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).json({ error: "Database onbereikbaar" });
    }
  });

  app.post("/api/marketplace", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const validatedData = insertMarketplaceSchema.parse(req.body);
      const result = await getDb().insert(marketplace).values(validatedData).returning();
      res.json(result[0]);
    } catch {
      res.status(400).send("Ongeldige data");
    }
  });

  app.delete("/api/marketplace/:id", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const { id } = req.params;
      await getDb().delete(marketplace).where(sql`${marketplace.id} = ${id}`);
      res.json({ success: true });
    } catch {
      res.status(500).send("Kon niet verwijderen");
    }
  });

  // --- ASO LOGBOEK (session-based; PIN login deprecated) ---
  app.post("/api/logbook/auth/login", (_req, res) => {
    res.status(410).json({
      error: "PIN-login is uitgefaseerd. Gebruik e-mail OTP via de app-login.",
    });
  });

  app.post("/api/logbook/entries", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const sessionUser = req.appUser!;
      if (!canWriteLogbook(sessionUser.profile.role)) {
        return res.status(403).json({ error: "Geen schrijfrechten voor het logboek" });
      }

      // Iedereen registreert alleen voor zichzelf (ook staf).
      const body = { ...(req.body ?? {}), userId: sessionUser.profile.id };
      const validated = insertLogbookEntrySchema.parse(body);

      const result = await getDb()
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

  app.get("/api/logbook/my-entries", requireAuth, async (req, res) => {
    try {
      const sessionUser = req.appUser!;
      const requestedId = String(req.query.userId || sessionUser.profile.id);
      let userId = sessionUser.profile.id;

      if (requestedId !== sessionUser.profile.id) {
        if (!canReviewAsoLogbooks(sessionUser.profile.role)) {
          return res.status(403).json({ error: "Je mag alleen je eigen logboek bekijken" });
        }
        const [target] = await getDb()
          .select({ id: users.id, role: users.role })
          .from(users)
          .where(eq(users.id, requestedId))
          .limit(1);
        if (!target || target.role !== "aso") {
          return res.status(403).json({ error: "Alleen ASO-logboeken zijn zichtbaar" });
        }
        userId = requestedId;
      }

      const entries = await getDb()
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

  app.get("/api/logbook/supervisor/all", requireAuth, async (req, res) => {
    try {
      const sessionUser = req.appUser!;
      if (!canReviewAsoLogbooks(sessionUser.profile.role)) {
        return res.status(403).json({ error: "Alleen staf mag ASO-logboeken nakijken" });
      }

      const asoId = req.query.asoId ? String(req.query.asoId) : "";
      const category = req.query.category ? String(req.query.category) : "";
      const subCategory = req.query.subCategory ? String(req.query.subCategory) : "";
      const technique = req.query.technique ? String(req.query.technique) : "";
      const startDate = req.query.startDate ? String(req.query.startDate) : "";
      const endDate = req.query.endDate ? String(req.query.endDate) : "";

      // Altijd enkel ASO-entries — nooit staf-logboeken van collega's.
      const filters: SQL[] = [eq(users.role, "aso")];
      if (asoId) filters.push(eq(logbookEntries.userId, asoId));
      if (category) filters.push(eq(logbookEntries.category, category));
      if (subCategory) filters.push(eq(logbookEntries.subCategory, subCategory));
      if (technique) filters.push(eq(logbookEntries.technique, technique));
      if (startDate) filters.push(gte(logbookEntries.date, startDate));
      if (endDate) filters.push(lte(logbookEntries.date, endDate));

      const entries = await getDb()
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
        .innerJoin(users, eq(logbookEntries.userId, users.id))
        .where(and(...filters))
        .orderBy(desc(logbookEntries.date), desc(logbookEntries.createdAt));

      res.json(entries);
    } catch (error) {
      console.error("Logbook supervisor error:", error);
      res.status(500).json({ error: "Kon overzicht niet ophalen" });
    }
  });

  app.get("/api/logbook/users", requireAuth, async (req, res) => {
    try {
      const role = req.query.role ? String(req.query.role) : "";
      const filters: SQL[] = [isNotNull(users.name), eq(users.active, true)];
      if (role === "aso" || role === "supervisor" || role === "staff") {
        filters.push(eq(users.role, role as UserRole));
      }

      const rows = await getDb()
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(and(...filters))
        .orderBy(users.name);

      const seedByUsername = new Map<string, SeedUser>(
        DEFAULT_LOGBOOK_USERS.map((seed) => [seed.username, seed]),
      );

      res.json(
        rows
          .map((row) => toPublicUser(row, seedByUsername.get(row.username)))
          .sort((a, b) => Number(a.hidden) - Number(b.hidden) || a.name.localeCompare(b.name, "nl")),
      );
    } catch (error) {
      console.error("Logbook users error:", error);
      res.status(500).json({ error: "Kon gebruikers niet ophalen" });
    }
  });

  // --- SMASH ---
  app.get("/api/spinal-logs", requireAuth, rejectKioskWrites, async (_req, res) => {
    try {
      const rows = await getDb()
        .select()
        .from(spinalLogs)
        .orderBy(desc(spinalLogs.createdAt));
      res.json(rows);
    } catch (error) {
      console.error("Spinal logs fetch error:", error);
      res.status(500).json({ error: "Kon logboek niet ophalen" });
    }
  });

  app.post("/api/spinal-logs", requireAuth, rejectKioskWrites, async (req, res) => {
    try {
      const body = { ...(req.body ?? {}) } as Record<string, unknown>;
      delete body.userId;
      delete body.pin;
      const validated = insertSpinalLogSchema.parse(body);
      const result = await getDb().insert(spinalLogs).values(validated).returning();
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

  // --- FLAPPY (public-ish but require login to reduce abuse) ---
  app.post("/api/highscores", requireAuth, async (req, res) => {
    try {
      const { name, score } = req.body;
      const numericScore = Number(score);

      if (!name || isNaN(numericScore)) {
        return res.status(400).send("Ongeldige data");
      }

      const cleanName = name.trim().toUpperCase();
      const database = getDb();
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

  app.get("/api/highscores", requireAuth, async (_req, res) => {
    try {
      const rows = await getDb()
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

  app.post("/api/game-stats/increment", requireAuth, async (_req, res) => {
    try {
      const key = "global_bird_attempts";
      const database = getDb();
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

  app.get("/api/game-stats", requireAuth, async (_req, res) => {
    try {
      const rows = await getDb()
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

  void httpServer;
  return httpServer;
}

// silence unused Request import lint in some configs
export type { Request, Response };
