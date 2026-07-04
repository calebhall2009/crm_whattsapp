// ─────────────────────────────────────────────────────────────
// Schema: pipelines — Kanban de etapas y deals
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { contacts } from "./contacts";
import { users } from "./users";

export const dealStatusEnum = pgEnum("deal_status", [
  "open",
  "won",
  "lost",
]);

// ── pipeline_stages ──────────────────────────────────────────
// Etapas configurables por empresa (ej. Nuevo, Contactado, Propuesta, Cerrado)

export const pipelineStages = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#6366f1"), // hex color
  order: integer("order").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── deals ────────────────────────────────────────────────────
// Oportunidades de venta vinculadas a un contacto y una etapa

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => pipelineStages.id, { onDelete: "restrict" }),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  value: numeric("value", { precision: 12, scale: 2 }),
  status: dealStatusEnum("status").notNull().default("open"),

  expectedCloseAt: timestamp("expected_close_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
