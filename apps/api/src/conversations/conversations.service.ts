// ─────────────────────────────────────────────────────────────
// Conversations Service
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { conversations, messages } from "@pos/database";
import { eq, and, desc } from "drizzle-orm";
import { withTenantTransaction } from "@pos/database";

@Injectable()
export class ConversationsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAll(companyId: string, options?: { status?: string; assignedTo?: string }) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      return tx
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.companyId, companyId),
            options?.status
              ? eq(conversations.status, options.status as any)
              : undefined,
            options?.assignedTo
              ? eq(conversations.assignedTo, options.assignedTo)
              : undefined
          )
        )
        .orderBy(desc(conversations.lastMessageAt));
    });
  }

  async findByContactId(companyId: string, contactId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [conv] = await tx
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.contactId, contactId),
            eq(conversations.companyId, companyId)
          )
        )
        .limit(1);
      return conv ?? null;
    });
  }

  /** Find or create a conversation thread for a WhatsApp contact */
  async upsertConversation(
    companyId: string,
    contactId: string,
    whatsappChatId: string
  ) {
    const existing = await this.findByContactId(companyId, contactId);
    if (existing) return existing;

    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [conv] = await tx
        .insert(conversations)
        .values({
          companyId,
          contactId,
          whatsappChatId,
          status: "bot",
          lastMessageAt: new Date(),
        } as any)
        .returning();
      return conv;
    });
  }

  async getMessages(companyId: string, conversationId: string, limit = 50) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      return tx
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, conversationId),
            eq(messages.companyId, companyId)
          )
        )
        .orderBy(desc(messages.sentAt))
        .limit(limit);
    });
  }

  async addMessage(
    companyId: string,
    conversationId: string,
    data: {
      role: "user" | "assistant" | "agent" | "system";
      body: string;
      waMessageId?: string;
      aiMetadata?: Record<string, unknown>;
    }
  ) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [msg] = await tx
        .insert(messages)
        .values({
          conversationId,
          companyId,
          role: data.role,
          body: data.body,
          waMessageId: data.waMessageId,
          aiMetadata: data.aiMetadata,
        } as any)
        .returning();

      // Update lastMessageAt on the conversation
      await tx
        .update(conversations)
        .set({ lastMessageAt: new Date() } as any)
        .where(eq(conversations.id, conversationId));

      return msg;
    });
  }

  async assignToAgent(companyId: string, conversationId: string, agentId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [updated] = await tx
        .update(conversations)
        .set({ status: "agent", assignedTo: agentId } as any)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.companyId, companyId)
          )
        )
        .returning();
      return updated;
    });
  }

  async resolve(companyId: string, conversationId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const [updated] = await tx
        .update(conversations)
        .set({ status: "resolved" } as any)
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.companyId, companyId)
          )
        )
        .returning();
      return updated;
    });
  }
}
