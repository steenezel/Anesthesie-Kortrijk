import express, { type Express, type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const log = (msg: string) => {
  const time = new Date().toLocaleTimeString("en-US", {
    hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  console.log(`${time} [server] ${msg}`);
};

async function startServer() {
  try {
    const httpServer = createServer(app);

    // Gebruik 'as any' om de strikte TS check in de editor te negeren
    await registerRoutes(httpServer as any, app as any);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (process.env.NODE_ENV !== "production") {
      // @ts-ignore
      const { setupVite } = await import("./vite.js");
      await setupVite(app as any, httpServer as any);
      log("Vite dev server gestart");
    } else {
      const publicPath = path.resolve(__dirname, "..", "public");
      app.use(express.static(publicPath));
      
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.resolve(publicPath, "index.html"));
      });
      log("Productie mode: statische bestanden actief");
    }

    const PORT = Number(process.env.PORT) || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();

// DIT IS DE ONTBREKENDE SCHAKEL VOOR VERCEL:
export default app;