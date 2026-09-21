import express from "express";
import { createServer } from "http";
import { toNodeHandler } from "better-auth/node";
import { registerRoutes } from "./routes.js";
import { getAuth } from "./auth.js";
import { isDatabaseConfigured } from "./db.js";
import path from "path";
import { existsSync } from "fs";

const app = express();

const log = (msg: string) => {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${time} [server] ${msg}`);
};

// Better Auth must run before body parsers (consumes the raw request stream).
if (isDatabaseConfigured) {
  try {
    const auth = getAuth();
    const handler = toNodeHandler(auth);
    app.all(/^\/api\/auth(\/.*)?$/, handler);
    log("Better Auth mounted at /api/auth/*");
  } catch (err) {
    console.error("Better Auth init failed:", err);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {
  const httpServer = createServer(app);

  await registerRoutes(httpServer as any, app as any);

  app.use((err: any, _req: any, res: any, next: any) => {
    void next;
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV !== "production") {
    const viteModule: any = await import("./vite.js");
    await viteModule.setupVite(httpServer, app);
    log("Vite dev server gestart");
  } else {
    const distPublicPath = path.resolve(process.cwd(), "dist", "public");
    const fallbackPublicPath = path.resolve(process.cwd(), "public");
    const publicPath = existsSync(distPublicPath) ? distPublicPath : fallbackPublicPath;
    app.use(express.static(publicPath));

    app.get(/.*/, (req: any, res: any, next: any) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.resolve(publicPath, "index.html"));
    });
    log("Productie mode: statische bestanden actief");
  }

  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

export default app;
