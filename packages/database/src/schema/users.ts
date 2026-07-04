// ─────────────────────────────────────────────────────────────
// Schema: users (employees within a tenant)
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { locations } from "./locations";

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "manager",
  "cashier",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").notNull().default("cashier"),
  locationId: uuid("location_id").references(() => locations.id, {
    onDelete: "set null",
  }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
