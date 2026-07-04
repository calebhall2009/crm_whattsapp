// ─────────────────────────────────────────────────────────────
// Schema: contacts — CRM leads & clients
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { users } from "./users";

export const contactStatusEnum = pgEnum("contact_status", [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "closed_won",
  "closed_lost",
]);

export const contactSourceEnum = pgEnum("contact_source", [
  "whatsapp",
  "manual",
  "import",
  "referral",
  "web",
]);

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(), // WhatsApp number E.164: +593...
  email: varchar("email", { length: 255 }),

  // CRM state
  status: contactStatusEnum("status").notNull().default("new"),
  source: contactSourceEnum("source").notNull().default("manual"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

  // Extra data
  tags: jsonb("tags").$type<string[]>().default([]),
  notes: text("notes"),
  customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default({}),

  // Timing
  lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
  nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
