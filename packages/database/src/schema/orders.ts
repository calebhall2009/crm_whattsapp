// ─────────────────────────────────────────────────────────────
// Schema: orders, order_items, payments
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  pgEnum,
  serial,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { locations } from "./locations";
import { users } from "./users";
import { items } from "./items";

export const orderStatusEnum = pgEnum("order_status", [
  "open",
  "completed",
  "voided",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "transfer",
  "other",
]);

// ── Orders ───────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  locationId: uuid("location_id")
    .notNull()
    .references(() => locations.id),
  cashierId: uuid("cashier_id")
    .notNull()
    .references(() => users.id),
  orderNumber: integer("order_number").notNull(),
  status: orderStatusEnum("status").notNull().default("open"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0.00"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ── Order Items ──────────────────────────────────────────────

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  modifiersJson: jsonb("modifiers_json"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  discountReason: varchar("discount_reason", { length: 255 }),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
});

// ── Payments ─────────────────────────────────────────────────

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
