// ─────────────────────────────────────────────────────────────
// Schema: items, item_modifiers, item_staff_assignments
// Flexible model supporting product, menu_item, and service
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { users } from "./users";

export const itemTypeEnum = pgEnum("item_type", [
  "product",
  "menu_item",
  "service",
]);

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: itemTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).notNull().default("0.0000"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // ── Product-specific ──────────────────────────────────────
  trackStock: boolean("track_stock").default(false),
  currentStock: integer("current_stock").default(0),

  // ── Service-specific ──────────────────────────────────────
  durationMinutes: integer("duration_minutes"),
});

// ── Menu item modifiers (e.g., "Extra cheese +$1.50") ───────

export const itemModifiers = pgTable("item_modifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  priceAdjustment: decimal("price_adjustment", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  isRequired: boolean("is_required").notNull().default(false),
});

// ── Service staff assignments (which users can provide this service) ─

export const itemStaffAssignments = pgTable("item_staff_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
});
