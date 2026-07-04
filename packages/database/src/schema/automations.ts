// ─────────────────────────────────────────────────────────────
// Schema: automations — Reglas de automatización de WhatsApp
// ─────────────────────────────────────────────────────────────

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "new_lead",           // Nuevo contacto creado desde WhatsApp
  "no_response_24h",    // Cliente no respondió en 24 horas
  "no_response_48h",    // Cliente no respondió en 48 horas
  "stage_changed",      // Contact moved to a different pipeline stage
  "appointment_booked", // Nueva cita agendada por el bot
  "keyword_received",   // Cliente envió una palabra clave específica
]);

export const automationActionEnum = pgEnum("automation_action", [
  "send_message",       // Enviar mensaje de WhatsApp (template o texto)
  "assign_agent",       // Asignar a un agente humano
  "move_stage",         // Mover contacto a otra etapa del pipeline
  "add_tag",            // Agregar tag al contacto
  "send_template",      // Enviar template aprobado de WhatsApp Business
  "create_appointment", // Crear una cita
]);

export const automations = pgTable("automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),

  // Trigger configuration
  trigger: automationTriggerEnum("trigger").notNull(),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}),
  // e.g. { keyword: "precio", stageId: "uuid" }

  // Action configuration
  action: automationActionEnum("action").notNull(),
  actionConfig: jsonb("action_config").$type<Record<string, unknown>>().default({}),
  // e.g. { message: "Hola! En qué te puedo ayudar?", templateName: "greeting" }

  // Delay before executing action
  delayMinutes: integer("delay_minutes").notNull().default(0),

  // Stats
  executionCount: integer("execution_count").notNull().default(0),
  lastExecutedAt: timestamp("last_executed_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
