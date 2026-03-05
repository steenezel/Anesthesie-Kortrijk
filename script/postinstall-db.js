import { execSync } from "node:child_process";

const hasDatabaseUrl = !!process.env.DATABASE_URL;

if (hasDatabaseUrl) {
  console.log("Running drizzle-kit push because DATABASE_URL is set...");
  try {
    execSync("npx drizzle-kit push", { stdio: "inherit" });
  } catch (error) {
    console.error("drizzle-kit push failed:", error);
    process.exit(1);
  }
} else {
  console.log("Skipping database push (no DATABASE_URL)");
}

