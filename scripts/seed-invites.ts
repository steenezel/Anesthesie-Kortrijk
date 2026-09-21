/**
 * Optional: seed invite allowlist from DEFAULT_INVITES.
 * Requires AUTH_SEED_FROM_CODE=1 — otherwise Supabase `invited_users` is the source of truth.
 *
 * Usage: AUTH_SEED_FROM_CODE=1 npm run auth:seed
 */
import { eq } from "drizzle-orm";
import { db } from "../server/db.js";
import { invitedUsers, users } from "../shared/schema.js";
import { DEFAULT_INVITES } from "../server/logbook-users.js";

async function main() {
  if (!db) {
    console.error("DATABASE_URL ontbreekt");
    process.exit(1);
  }

  if (process.env.AUTH_SEED_FROM_CODE !== "1") {
    console.log(
      "Skip: AUTH_SEED_FROM_CODE is niet 1.\n" +
        "Beheer invites in Supabase → invited_users (docs/INVITES_SUPABASE.md).\n" +
        "Of: AUTH_SEED_FROM_CODE=1 npm run auth:seed",
    );
    process.exit(0);
  }

  const adminEmail = process.env.AUTH_SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const invites = DEFAULT_INVITES.map((inv) => {
    if (inv.username === "dev" && adminEmail) {
      return { ...inv, email: adminEmail };
    }
    return inv;
  });

  for (const inv of invites) {
    const email = inv.email.trim().toLowerCase();
    const existing = await db
      .select()
      .from(invitedUsers)
      .where(eq(invitedUsers.email, email))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(invitedUsers).values({
        email,
        name: inv.name,
        role: inv.role,
        username: inv.username ?? null,
        active: true,
      });
      console.log(`+ invite ${email} (${inv.role})`);
    } else {
      await db
        .update(invitedUsers)
        .set({
          name: inv.name,
          role: inv.role,
          username: inv.username ?? null,
          active: true,
        })
        .where(eq(invitedUsers.email, email));
      console.log(`~ invite ${email}`);
    }

    if (inv.username) {
      const legacy = await db
        .select()
        .from(users)
        .where(eq(users.username, inv.username))
        .limit(1);
      if (legacy[0] && !legacy[0].email) {
        await db
          .update(users)
          .set({ email, role: inv.role, active: true })
          .where(eq(users.id, legacy[0].id));
        console.log(`  linked users.${inv.username} → ${email}`);
      }
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
