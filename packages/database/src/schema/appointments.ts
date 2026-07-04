// ─────────────────────────────────────────────────────────────
// Schema: appointments — citas agendadas (por bot o agente)
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { contacts } from "./contacts";
import { users } from "./users";

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",     // Agendada, pendiente de confirmación
  "confirmed",   // Confirmada por el agente/negocio
  "completed",   // Completada
  "cancelled",   // Cancelada
  "no_show",     // El cliente no se presentó
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),

  // Appointment details
  title: varchar("title", { length: 255 }).notNull(), // ej. "Consulta inicial", "Corte de cabello"
  notes: text("notes"),
  status: appointmentStatusEnum("status").notNull().default("pending"),

  // Scheduling
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  timezone: varchar("timezone", { length: 50 }).notNull().default("America/Guayaquil"),

  // Reminders
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
