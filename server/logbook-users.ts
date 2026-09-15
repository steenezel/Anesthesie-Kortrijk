/**
 * Bron van waarheid voor de zichtbare ASO-/supervisorlijst.
 * Alleen deze usernames verschijnen in de app.
 * Zet `hidden: true` voor testaccounts.
 */
export const DEFAULT_LOGBOOK_USERS = [
  { username: "emma", name: "Emma Collin", role: "aso" as const, pin: "5758" },
  { username: "sanne", name: "Sanne Decorte", role: "aso" as const, pin: "6140" },
  { username: "magnus", name: "Magnus Van Kerckhove", role: "aso" as const, pin: "2277" },
  { username: "staf", name: "Supervisor Staf", role: "supervisor" as const, pin: "6666" },
  { username: "test", name: "Test Gebruiker", role: "aso" as const, pin: "0000", hidden: true },
] as const;

export type SeedUser = (typeof DEFAULT_LOGBOOK_USERS)[number];
