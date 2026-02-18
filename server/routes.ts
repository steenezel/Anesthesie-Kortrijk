import type { Express } from "express";
import { createServer, type Server } from "http";
import { kv } from "@vercel/kv"; 

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 1. Endpoint om een score op te slaan
  app.post("/api/highscores", async (req, res) => {
    try {
      const { name, score } = req.body;
      
      if (!name || typeof score !== 'number') {
        return res.status(400).json({ message: "Naam en score zijn verplicht." });
      }

      // We gebruiken een 'Sorted Set' genaamd 'flappy_anesthetist'
      // Redis sorteert dit automatisch voor ons.
      await kv.zadd("flappy_anesthetist", { score: score, member: name });

      res.json({ success: true });
    } catch (error) {
      console.error("Redis Error:", error);
      res.status(500).json({ message: "Kon score niet opslaan in de maatschap-database." });
    }
  });

  // 2. Endpoint om de Top 10 op te halen
  app.get("/api/highscores", async (req, res) => {
    try {
      // Haal de hoogste 10 scores op
      const topScores = await kv.zrange("flappy_anesthetist", 0, 9, { 
        rev: true, 
        withScores: true 
      });
      res.json(topScores);
    } catch (error) {
      res.status(500).json({ message: "Leaderboard tijdelijk offline." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}