import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp } from "fs/promises"; // cp is cruciaal
import path from "path";

const allowlist = [
  "@google/generative-ai", "axios", "connect-pg-simple", "cors", "date-fns",
  "drizzle-orm", "drizzle-zod", "express", "express-rate-limit",
  "express-session", "jsonwebtoken", "memorystore", "multer", "nanoid",
  "nodemailer", "openai", "passport", "passport-local", "pg", "stripe",
  "uuid", "ws", "xlsx", "zod", "zod-validation-error",
];

async function buildAll() {
  // 1. Schoon de dist map op
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  // 2. Dwing de admin-bestanden naar de dist map
  // Dit lost de 404 op omdat de bestanden nu fysiek bestaan in de output
  console.log("copying admin files...");
  try {
    await cp("client/public/admin", "dist/public/admin", { recursive: true });
    console.log("Admin files gekopieerd naar dist/public/admin");
  } catch (err) {
    console.error("Fout bij kopiëren admin files (bestaan ze in client/public/admin?):", err);
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    external: externals,
    sourcemap: true,
  });
}

// 3. De onmisbare foutafhandeling die je noemde:
buildAll().catch((err) => {
  console.error("Build gefaald:", err);
  process.exit(1);
});