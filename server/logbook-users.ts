/**
 * Optional bootstrap invites for `npm run auth:seed` (only if AUTH_SEED_FROM_CODE=1).
 * Day-to-day allowlist: manage in Supabase → Table Editor → `invited_users`
 * (see docs/INVITES_SUPABASE.md).
 */
import type { UserRole } from "../shared/schema.js";

export type InviteSeed = {
  email: string;
  name: string;
  role: UserRole;
  username?: string;
};

/** Used only when AUTH_SEED_FROM_CODE=1 — prefer Supabase for real invites. */
export const DEFAULT_INVITES: InviteSeed[] = [
  {
    email: "dev@localhost.test",
    name: "Dev Tester",
    role: "admin",
    username: "dev",
  },
];

/** Legacy PIN seeds — not used for login. */
export const DEFAULT_LOGBOOK_USERS = [
  { username: "emma", name: "Emma Collin", role: "aso" as const, pin: "5758" },
  { username: "sanne", name: "Sanne Decorte", role: "aso" as const, pin: "6140" },
  { username: "magnus", name: "Magnus Van Kerckhove", role: "aso" as const, pin: "2277" },
  { username: "staf", name: "Supervisor Staf", role: "supervisor" as const, pin: "6666" },
  { username: "test", name: "Test Gebruiker", role: "aso" as const, pin: "0000", hidden: true },
] as const;

export type SeedUser = (typeof DEFAULT_LOGBOOK_USERS)[number];
