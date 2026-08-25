import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = ["aso", "supervisor"] as const;
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

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").$type<UserRole>().notNull().default("aso"),
  pin: text("pin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  pin: true,
});

export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const publicUserSchema = selectUserSchema.pick({
  id: true,
  username: true,
  name: true,
  role: true,
});
export type PublicUser = z.infer<typeof publicUserSchema>;

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
  date: text("date").notNull(), // We slaan de datum op als ISO string of YYYY-MM-DD
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
