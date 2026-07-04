// ─────────────────────────────────────────────────────────────
// Root Application Module — Versión simplificada para CRM + WhatsApp IA
// ─────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";

import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { AuditModule } from "./audit/audit.module";
import { HealthModule } from "./health/health.module";
import { OnboardingModule } from "./onboarding/onboarding.module";

// ── CRM Modules ───────────────────────────────────────────────
import { ContactsModule } from "./contacts/contacts.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { AiAgentModule } from "./ai-agent/ai-agent.module";

// ── Company / User Management ─────────────────────────────────
import { CompaniesModule } from "./companies/companies.module";
import { UsersModule } from "./users/users.module";
import { LocationsModule } from "./locations/locations.module";

@Module({
  imports: [
    // ── Rate Limiting (protección básica) ─────────────────────
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 20 },
      { name: "long", ttl: 60000, limit: 200 },
    ]),

    // ── Core ──────────────────────────────────────────────────
    DatabaseModule,
    AuthModule,      // JWT propio (sin Clerk)
    AdminModule,     // Panel super admin (desarrollador)
    AuditModule,
    HealthModule,

    // ── Onboarding ────────────────────────────────────────────
    OnboardingModule,

    // ── Company & User management ─────────────────────────────
    CompaniesModule,
    UsersModule,
    LocationsModule,

    // ── CRM ───────────────────────────────────────────────────
    ContactsModule,
    ConversationsModule,
    AiAgentModule,
    WhatsAppModule,
  ],
})
export class AppModule {}
