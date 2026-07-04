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
  // companyId can be null for super admins who don't belong to a tenant
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  role: userRoleEnum("role").notNull().default("cashier"),
  locationId: uuid("location_id").references(() => locations.id, {
    onDelete: "set null",
  }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  // Password hash (bcrypt). Nullable only for users imported via legacy methods.
  passwordHash: varchar("password_hash", { length: 255 }),
  // Super admins can see ALL companies in the admin panel
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
