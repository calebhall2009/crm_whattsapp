// ─────────────────────────────────────────────────────────────
// Schema: companies (tenant root)
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────

export const countryEnum = pgEnum("country", [
  "EC",
  "CL",
  "PE",
  "CO",
  "US",
]);

export const currencyEnum = pgEnum("currency", [
  "USD",
  "CLP",
  "PEN",
  "COP",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
]);

// ── Table ────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  country: countryEnum("country").notNull(),
  currency: currencyEnum("currency").notNull(),
  taxId: varchar("tax_id", { length: 50 }),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .notNull()
    .default("trialing"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  domain: varchar("domain", { length: 255 }).unique(),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
