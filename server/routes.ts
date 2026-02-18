import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { Redis } from "@upstash/redis";

/**
 * We initialiseren de Redis client buiten de functie.
 * Vercel vult de KV_REST_API_URL en KV_REST_API_TOKEN automatisch in
 * vanuit je omgevingsvariabelen.
 */
const redis = Redis.fromEnv();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- START FLAPPY API (REDIS / UPSTASH) ---

  // 1. TEST ROUTE: Om te zien of de database "leeft"
  app.get("/api/kv-test", async (_req, res) => {
    try {
      const testKey = "test_connection";
      const testValue = "OK - " + new Date().toLocaleTimeString('nl-BE');
      
      await redis.set(testKey, testValue);
      const result = await redis.get(testKey);
      
      res.json({ 
        status: "success", 
        message: "Verbinding met Upstash/Redis werkt!", 
        data: result 
      });
    } catch (error) {
      console.error("Redis Connection Error:", error);
      res.status(500).json({ 
        status: "error", 
        message: "Database verbinding mislukt",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // 2. SCORE OPSLAAN
  app.post("/api/highscores", async (req, res) => {
    try {
      const { name, score } = req.body;
      if (!name || typeof score !== 'number') {
        return res.status(400).json({ message: "Naam en score zijn verplicht" });
      }

      // ZADD voegt de score toe aan de gesorteerde lijst
      await redis.zadd("flappy_anesthetist", { score, member: name });
      res.json({ success: true });
    } catch (error) {
      console.error("Score Save Error:", error);
      res.status(500).json({ message: "Kon score niet opslaan" });
    }
  });

  // 3. TOP 10 OPHALEN
  app.get("/api/highscores", async (_req, res) => {
    try {
      // ZRANGE met 'rev: true' haalt de hoogste scores eerst op
      const topScores = await redis.zrange("flappy_anesthetist", 0, 9, { 
        rev: true, 
        withScores: true 
      });
      
      // Upstash geeft dit terug als een array van objecten: [{member: "X", score: 10}, ...]
      res.json(topScores);
    } catch (error) {
      console.error("Leaderboard Fetch Error:", error);
      res.status(500).json({ message: "Kon leaderboard niet ophalen" });
    }
  });

  // 4. GLOBAL COUNTER: OPHOGEN
  app.post("/api/game-stats/increment", async (_req, res) => {
    try {
      const totalAttempts = await redis.incr("global_bird_attempts");
      res.json({ totalAttempts });
    } catch (error) {
      res.status(500).json({ message: "Kon teller niet bijwerken" });
    }
  });

  // 5. GLOBAL COUNTER: OPHALEN
  app.get("/api/game-stats", async (_req, res) => {
    try {
      const totalAttempts = await redis.get("global_bird_attempts");
      res.json({ totalAttempts: totalAttempts || 0 });
    } catch (error) {
      res.status(500).json({ message: "Kon teller niet ophalen" });
    }
  });

  // 6. ADMIN: VERWIJDEREN (Optioneel, mocht je het toch nodig hebben)
  app.delete("/api/highscores/:name", async (req, res) => {
    try {
      await redis.zrem("flappy_anesthetist", req.params.name);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Verwijderen mislukt" });
    }
  });

  // --- EINDE FLAPPY API ---

  return httpServer;
}