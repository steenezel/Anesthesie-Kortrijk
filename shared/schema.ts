import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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
