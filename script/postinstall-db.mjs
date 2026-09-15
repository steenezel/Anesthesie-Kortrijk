if (process.env.DATABASE_URL) {
  const { execSync } = await import("node:child_process");
  execSync("npx drizzle-kit push", { stdio: "inherit" });
} else {
  console.log("Skipping database push (no DATABASE_URL)");
}
