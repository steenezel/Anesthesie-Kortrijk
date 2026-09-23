import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  boolean,
  integer,
  real,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/** App roles: aso / staff / supervisor / kiosk (read-only CDS) / admin */
export const userRoles = ["aso", "staff", "supervisor", "kiosk", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const logbookStatuses = ["pass", "fail"] as const;
export type LogbookStatus = (typeof logbookStatuses)[number];

export const logbookSupervisionLevels = [
  "Gekeken",
  "Onder supervisie uitgevoerd",
  "Zelfstandig uitgevoerd",
  "Als supervisor uitgevoerd",
] as const;
export type LogbookSupervisionLevel = (typeof logbookSupervisionLevels)[number];

/**
 * App profiles (logboek, prefs, SRS). Linked to Better Auth `user` via email / authUserId.
 * Legacy PIN fields kept nullable for migration only.
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull().default(""),
  name: text("name"),
  email: text("email").unique(),
  role: text("role").$type<UserRole>().notNull().default("aso"),
  pin: text("pin"),
  active: boolean("active").notNull().default(true),
  authUserId: text("auth_user_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  pin: true,
  active: true,
  authUserId: true,
});

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const publicUserSchema = selectUserSchema.pick({
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
});
export type PublicUser = z.infer<typeof publicUserSchema>;

/** Invite allowlist — only these emails may request an OTP. */
export const invitedUsers = pgTable("invited_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<UserRole>().notNull().default("staff"),
  username: text("username"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InvitedUser = typeof invitedUsers.$inferSelect;

/* ---------- Better Auth core tables ---------- */

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** Synced personal preferences (theme, home modules). */
export const userPreferences = pgTable("user_preferences", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  prefs: jsonb("prefs").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** Quiz SRS / progress per user. */
export const quizProgress = pgTable("quiz_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  easeFactor: real("ease_factor").notNull().default(2.5),
  intervalDays: integer("interval_days").notNull().default(0),
  repetitions: integer("repetitions").notNull().default(0),
  dueAt: timestamp("due_at").notNull().defaultNow(),
  lastResult: text("last_result"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookmarkItemTypes = ["protocol", "block", "pocus", "calculator"] as const;
export type BookmarkItemType = (typeof bookmarkItemTypes)[number];

export const userBookmarks = pgTable(
  "user_bookmarks",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: text("item_type").$type<BookmarkItemType>().notNull(),
    itemId: text("item_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique("user_bookmarks_user_item_uniq").on(t.userId, t.itemType, t.itemId)],
);

export const insertUserBookmarkSchema = z.object({
  itemType: z.enum(bookmarkItemTypes),
  itemId: z.string().trim().min(1),
});
export type UserBookmark = typeof userBookmarks.$inferSelect;

export const noteTargetTypes = ["protocol", "block", "general"] as const;
export type NoteTargetType = (typeof noteTargetTypes)[number];

export const userNotes = pgTable(
  "user_notes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: text("target_type").$type<NoteTargetType>().notNull(),
    /** Empty string for general notes (keeps unique constraint simple). */
    targetId: text("target_id").notNull().default(""),
    content: text("content").notNull().default(""),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [unique("user_notes_user_target_uniq").on(t.userId, t.targetType, t.targetId)],
);

export const upsertUserNoteSchema = z.object({
  targetType: z.enum(noteTargetTypes),
  targetId: z.string().optional().nullable(),
  content: z.string(),
});
export type UserNote = typeof userNotes.$inferSelect;

export const auditActions = ["created", "updated", "published", "deleted"] as const;
export type AuditAction = (typeof auditActions)[number];

export const auditResourceTypes = ["protocol", "block", "pocus", "journal_club"] as const;
export type AuditResourceType = (typeof auditResourceTypes)[number];

export const contentAuditLogs = pgTable("content_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userKortenaam: text("user_kortenaam").notNull(),
  action: text("action").$type<AuditAction>().notNull(),
  resourceType: text("resource_type").$type<AuditResourceType>().notNull(),
  resourceId: text("resource_id").notNull(),
  details: jsonb("details").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentAuditSchema = z.object({
  action: z.enum(auditActions),
  resourceType: z.enum(auditResourceTypes),
  resourceId: z.string().trim().min(1),
  details: z.record(z.unknown()).optional().nullable(),
});
export type ContentAuditLog = typeof contentAuditLogs.$inferSelect;

export const logbookEntries = pgTable("logbook_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  category: text("category").notNull(),
  subCategory: text("sub_category").notNull(),
  technique: text("technique").notNull(),
  status: text("status").$type<LogbookStatus>().notNull(),
  date: text("date").notNull(),
  supervisionLevel: text("supervision_level").$type<LogbookSupervisionLevel>(),
  supervisorName: text("supervisor_name"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLogbookEntrySchema = createInsertSchema(logbookEntries)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    status: z.enum(logbookStatuses),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    supervisorName: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    supervisionLevel: z.enum(logbookSupervisionLevels).optional().nullable(),
  });

export const selectLogbookEntrySchema = createSelectSchema(logbookEntries);
export type InsertLogbookEntry = z.infer<typeof insertLogbookEntrySchema>;
export type LogbookEntry = typeof logbookEntries.$inferSelect;

export const marketplace = pgTable("marketplace", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerName: text("providerName").notNull(),
  date: text("date").notNull(),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
});

export const insertMarketplaceSchema = createInsertSchema(marketplace).pick({
  providerName: true,
  date: true,
});

export type InsertMarketplace = z.infer<typeof insertMarketplaceSchema>;
export type Marketplace = typeof marketplace.$inferSelect;

export const spinalAgents = ["Scandicaine", "Isobare Marcaine"] as const;
export type SpinalAgent = (typeof spinalAgents)[number];

/** Accepts "2,5" or "2.5" and validates 1–5 ml. */
export const doseMlSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const normalized = val.trim().replace(",", ".");
    if (normalized === "") return undefined;
    return Number(normalized);
  }
  return val;
}, z
  .number({
    required_error: "Vul de dosis in ml in",
    invalid_type_error: "Vul de dosis in ml in",
  })
  .min(1, "Dosis moet tussen 1 en 5 ml liggen")
  .max(5, "Dosis moet tussen 1 en 5 ml liggen"));

export const spinalLogs = pgTable("spinal_logs", {
  id: serial("id").primaryKey(),
  aslOrAnesthetistName: text("asl_or_anesthetist_name").notNull(),
  patientIdentifier: text("patient_identifier").notNull(),
  agentUsed: text("agent_used").$type<SpinalAgent>().notNull().default("Scandicaine"),
  doseAdministered: real("dose_administered").notNull(),
  timeToSurgeryStart: integer("time_to_surgery_start").notNull(),
  surgicalSuccess: boolean("surgical_success").notNull(),
  failureInsufficientDuration: boolean("failure_insufficient_duration").notNull().default(false),
  failureInsufficientMotor: boolean("failure_insufficient_motor").notNull().default(false),
  failureInsufficientSensory: boolean("failure_insufficient_sensory").notNull().default(false),
  pacuStayDuration: integer("pacu_stay_duration").notNull(),
  urinaryRetention: boolean("urinary_retention").notNull(),
  opioidsNeededPacu: boolean("opioids_needed_pacu").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpinalLogSchema = createInsertSchema(spinalLogs)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    aslOrAnesthetistName: z.string().trim().min(2, "Naam of initialen verplicht"),
    patientIdentifier: z.string().trim().min(1, "Initialen patiënt verplicht"),
    agentUsed: z.enum(spinalAgents),
    doseAdministered: doseMlSchema,
    timeToSurgeryStart: z.coerce
      .number()
      .int()
      .min(0, "Tijd tot start chirurgie kan niet negatief zijn"),
    surgicalSuccess: z.boolean(),
    failureInsufficientDuration: z.boolean().default(false),
    failureInsufficientMotor: z.boolean().default(false),
    failureInsufficientSensory: z.boolean().default(false),
    pacuStayDuration: z.coerce.number().int().min(0, "PACU-duur kan niet negatief zijn"),
    urinaryRetention: z.boolean(),
    opioidsNeededPacu: z.boolean(),
    notes: z.string().trim().optional().nullable(),
  })
  .transform((data) => {
    if (data.surgicalSuccess) {
      return {
        ...data,
        failureInsufficientDuration: false,
        failureInsufficientMotor: false,
        failureInsufficientSensory: false,
        notes: data.notes?.trim() ? data.notes.trim() : null,
      };
    }
    return {
      ...data,
      notes: data.notes?.trim() ? data.notes.trim() : null,
    };
  });

export const selectSpinalLogSchema = createSelectSchema(spinalLogs);
export type InsertSpinalLog = z.infer<typeof insertSpinalLogSchema>;
export type SpinalLog = typeof spinalLogs.$inferSelect;

export const gameHighscores = pgTable("game_highscores", {
  name: text("name").primaryKey(),
  score: integer("score").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});
