// ─────────────────────────────────────────────────────────────
// Admin Service — Panel de Monitoreo para el Desarrollador
//
// Solo accesible para usuarios con isSuperAdmin = true.
// Permite ver todos los tenants, sus stats y los tickets de soporte.
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject, ForbiddenException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies, users, contacts, conversations, supportTickets } from "@pos/database";
import { eq, count, desc } from "drizzle-orm";
import type { AuthContext } from "../auth/jwt.guard";

@Injectable()
export class AdminService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  private ensureSuperAdmin(auth: AuthContext) {
    if (!auth.isSuperAdmin) {
      throw new ForbiddenException("Acceso denegado. Solo para administradores del sistema.");
    }
  }

  // ── Lista todas las empresas registradas ───────────────────
  async getAllCompanies(auth: AuthContext) {
    this.ensureSuperAdmin(auth);

    const allCompanies = await this.db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));

    // Para cada empresa, obtener stats básicas
    const companiesWithStats = await Promise.all(
      allCompanies.map(async (company) => {
        const [userCount] = await this.db
          .select({ count: count() })
          .from(users)
          .where(eq(users.companyId, company.id));

        const [contactCount] = await this.db
          .select({ count: count() })
          .from(contacts)
          .where(eq(contacts.companyId, company.id));

        const [conversationCount] = await this.db
          .select({ count: count() })
          .from(conversations)
          .where(eq(conversations.companyId, company.id));

        return {
          ...company,
          stats: {
            users: userCount?.count ?? 0,
            contacts: contactCount?.count ?? 0,
            conversations: conversationCount?.count ?? 0,
          },
        };
      })
    );

    return companiesWithStats;
  }

  // ── Lista todos los tickets de soporte ────────────────────
  async getAllTickets(auth: AuthContext, status?: string) {
    this.ensureSuperAdmin(auth);

    const query = this.db
      .select({
        ticket: supportTickets,
        company: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(supportTickets)
      .leftJoin(companies, eq(supportTickets.companyId, companies.id))
      .orderBy(desc(supportTickets.createdAt));

    return await query;
  }

  // ── Responder un ticket de soporte ───────────────────────
  async replyToTicket(
    auth: AuthContext,
    ticketId: string,
    reply: string,
    newStatus?: "open" | "in_progress" | "resolved" | "closed"
  ) {
    this.ensureSuperAdmin(auth);

    const [updated] = await this.db
      .update(supportTickets)
      .set({
        adminReply: reply,
        adminRepliedAt: new Date(),
        status: (newStatus ?? "resolved") as any,
        updatedAt: new Date(),
      } as any)
      .where(eq(supportTickets.id, ticketId))
      .returning();

    return updated;
  }

  // ── Resumen global del sistema ───────────────────────────
  async getSystemSummary(auth: AuthContext) {
    this.ensureSuperAdmin(auth);

    const [companyCount] = await this.db.select({ count: count() }).from(companies);
    const [userCount] = await this.db.select({ count: count() }).from(users);
    const [contactCount] = await this.db.select({ count: count() }).from(contacts);
    const [conversationCount] = await this.db.select({ count: count() }).from(conversations);
    const [openTickets] = await this.db
      .select({ count: count() })
      .from(supportTickets)
      .where(eq(supportTickets.status, "open"));

    return {
      companies: companyCount?.count ?? 0,
      users: userCount?.count ?? 0,
      contacts: contactCount?.count ?? 0,
      conversations: conversationCount?.count ?? 0,
      openTickets: openTickets?.count ?? 0,
    };
  }
}
