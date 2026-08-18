import { existsSync } from "fs";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

const envPath = resolve(process.cwd(), ".env");
if (!process.env.DATABASE_URL && existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL ontbreekt. Zet deze in .env of in de Vercel-omgeving.");
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
