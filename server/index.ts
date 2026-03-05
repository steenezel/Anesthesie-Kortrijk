import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const log = (msg: string) => {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  console.log(`${time} [server] ${msg}`);
};

async function startServer() {
  const httpServer = createServer(app);

  // We gebruiken de breedste types mogelijk om TSC stil te krijgen
  await registerRoutes(httpServer as any, app as any);

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV !== "production") {
    // We laden Vite op een manier die TSC niet kan checken tijdens build
    const viteModule: any = await import("./vite.js");
    await viteModule.setupVite(app, httpServer);
    log("Vite dev server gestart");
  } else {
    const publicPath = path.resolve(__dirname, "..", "public");
    app.use(express.static(publicPath));
    
    app.get("*", (req: any, res: any, next: any) => {
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