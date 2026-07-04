// ─────────────────────────────────────────────────────────────
// Schema: fiscal_documents
// Tracks the lifecycle of each fiscal document (invoice/receipt)
// per country, decoupled from the specific provider
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { orders } from "./orders";
import { countryEnum } from "./companies";

export const fiscalStatusEnum = pgEnum("fiscal_status", [
  "pending",
  "sent",
  "authorized",
  "rejected",
  "voided",
]);

export const fiscalDocumentTypeEnum = pgEnum("fiscal_document_type", [
  "invoice",
  "receipt",
  "credit_note",
]);

export const fiscalDocuments = pgTable("fiscal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  country: countryEnum("country").notNull(),
  documentType: fiscalDocumentTypeEnum("document_type").notNull().default("invoice"),
  providerDocumentId: varchar("provider_document_id", { length: 255 }),
  status: fiscalStatusEnum("status").notNull().default("pending"),
  xmlPayload: text("xml_payload"),
  errorMessage: text("error_message"),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  authorizedAt: timestamp("authorized_at", { withTimezone: true }),
});
