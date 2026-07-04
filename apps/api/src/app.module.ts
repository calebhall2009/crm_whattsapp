// ─────────────────────────────────────────────────────────────
// Root Application Module
// ─────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";

import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
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

// ── Legacy POS (data history only) ────────────────────────────
import { ItemsModule } from "./items/items.module";
import { OrdersModule } from "./orders/orders.module";
import { ReportsModule } from "./reports/reports.module";
import { FiscalModule } from "./fiscal/fiscal.module";
import { BillingModule } from "./billing/billing.module";

@Module({
  imports: [
    // ── Rate Limiting ─────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 10 },
      { name: "long", ttl: 60000, limit: 100 },
    ]),

    // ── Queue (BullMQ + Redis) ────────────────────────────────
    BullModule.forRoot({
      connection: process.env.REDIS_URL
        ? process.env.REDIS_URL
        : {
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
            password: process.env.REDIS_PASSWORD || undefined,
            tls: process.env.REDIS_TLS === "true" ? {} : undefined,
          },
    }),

    // ── Core ──────────────────────────────────────────────────
    DatabaseModule,
    AuthModule,
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

    // ── Legacy POS ────────────────────────────────────────────
    ItemsModule,
    OrdersModule,
    ReportsModule,
    FiscalModule,
    BillingModule,
  ],
})
export class AppModule {}

