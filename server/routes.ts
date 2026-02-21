import type { Express } from "express";
import { type Server } from "http";
import Redis from "ioredis";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  const redis = new Redis(process.env.REDIS_URL || "");
  redis.on("error", (err) => {
    console.error("Redis Runtime Error:", err);
  });

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

