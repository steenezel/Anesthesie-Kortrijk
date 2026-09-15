import { existsSync } from "fs";
import { resolve } from "path";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js";

const envPath = resolve(process.cwd(), ".env");
if (!process.env.DATABASE_URL && existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

/**
 * Server-side Postgres — gebruik de **Supabase** connection string
 * (Project Settings → Database → URI, bij voorkeur pooled / Transaction mode).
 * Zelfde project als VITE_SUPABASE_* voor CMS.
 */
const connectionString = process.env.DATABASE_URL;
export const isDatabaseConfigured = Boolean(connectionString);

export const db: PostgresJsDatabase<typeof schema> | null = connectionString
  ? drizzle(postgres(connectionString, { prepare: false }), { schema })
  : null;
