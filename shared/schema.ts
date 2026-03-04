import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
