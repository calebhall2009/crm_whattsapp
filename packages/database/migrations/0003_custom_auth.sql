-- ── Migración Manual: custom_auth y support_tickets ──

-- 1. Crear enums para Tickets de Soporte
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');

-- 2. Modificar tabla users
-- Cambiar company_id a opcional (nullable) para super admins
ALTER TABLE "users" ALTER COLUMN "company_id" DROP NOT NULL;

-- Eliminar columna de Clerk
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_user_id";

-- Agregar nuevas columnas
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);
ALTER TABLE "users" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;

-- Hacer el correo electrónico único
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");

-- 3. Crear tabla support_tickets
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"admin_reply" text,
	"admin_replied_at" timestamp with time zone,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Agregar llaves foráneas a support_tickets
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
