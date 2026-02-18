import type { Express } from "express";
import { type Server } from "http"; // createServer is hier niet meer nodig als import
import { storage } from "./storage";
import { kv } from "@vercel/kv"; // Vergeet deze import niet!

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // --- START FLAPPY API ---

  // 1. DE TEST ROUTE
  app.get("/api/kv-test", async (_req, res) => {
    try {
      await kv.set("test_connection", "OK - " + new Date().toISOString());
      const value = await kv.get("test_connection");
      res.json({ status: "success", message: "Verbinding met Vercel KV werkt!", data: value });
    } catch (error) {
      res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  });

  // 2. SCORE OPSLAAN
  app.post("/api/highscores", async (req, res) => {
    try {
      const { name, score } = req.body;
      if (!name || typeof score !== 'number') return res.status(400).send("Ongeldige data");
      
      await kv.zadd("flappy_anesthetist", { score, member: name });
      res.json({ success: true });
    } catch (error) {
      res.status(500).send("Database fout");
    }
  });

  // 3. TOP 10 OPHALEN
  app.get("/api/highscores", async (_req, res) => {
    try {
      const topScores = await kv.zrange("flappy_anesthetist", 0, 9, { rev: true, withScores: true });
      res.json(topScores);
    } catch (error) {
      res.status(500).send("Database onbereikbaar");
    }
  });

  // 4. ADMIN: VERWIJDEREN
  app.delete("/api/highscores/:name", async (req, res) => {
    try {
      await kv.zrem("flappy_anesthetist", req.params.name);
      res.json({ success: true });
    } catch (error) {
      res.status(500).send("Verwijderen mislukt");
    }
  });

  // --- EINDE FLAPPY API ---

  return httpServer;
}