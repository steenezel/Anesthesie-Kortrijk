import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js"; // .js extensie toegevoegd
import { setupVite, serveStatic, log } from "./vite.js"; // .js extensie toegevoegd
import { db } from "./db.js"; // .js extensie toegevoegd
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware voor logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let resBody: any = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    resBody = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (resBody) {
        logLine += ` :: ${JSON.stringify(resBody)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    // 1. Database Migratie (Voorkomt de terminal 'db:push' noodzaak)
    log("Checking database migrations...");
    // We wijzen naar de drizzle map in de root
    await migrate(db, { 
      migrationsFolder: path.resolve(__dirname, "../drizzle") 
    });
    log("Database migrations complete.");

    // 2. Registreer API Routes
    const server = await registerRoutes(app);

    // 3. Error Handling Middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // 4. Vite of Statische Bestanden setup
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // 5. Start de server
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer();