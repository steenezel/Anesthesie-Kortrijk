import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import Redis from "ioredis";

// We initialiseren de verbinding met de volledige URL
// ioredis haalt de gebruikersnaam, wachtwoord en poort hier automatisch uit.
const redis = new Redis(process.env.REDIS_URL || "");

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. TEST ROUTE
  app.get("/api/kv-test", async (_req, res) => {
    try {
      await redis.set("test_connection", "OK - verbinding via RedisLabs");
      const result = await redis.get("test_connection");
      res.json({ status: "success", data: result });
    } catch (error) {
      console.error("Redis Connection Error:", error);
      res.status(500).json({ 
        status: "error", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // 2. SCORE OPSLAAN
  app.post("/api/highscores", async (req, res) => {
    try {
      const { name, score } = req.body;
      if (!name || typeof score !== 'number') return res.status(400).send("Ongeldige data");
      
      // ioredis gebruikt een iets andere syntax voor zadd dan upstash
      await redis.zadd("flappy_anesthetist", score, name);
      res.json({ success: true });
    } catch (error) {
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
        scores.push({ member: rawData[i], score: parseInt(rawData[i+1]) });
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