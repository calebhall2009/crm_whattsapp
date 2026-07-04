// ─────────────────────────────────────────────────────────────
// WhatsApp Service — Meta Cloud API sender & message parser
// ─────────────────────────────────────────────────────────────

import { Injectable, Logger, Inject } from "@nestjs/common";
import { ContactsService } from "../contacts/contacts.service";
import { ConversationsService } from "../conversations/conversations.service";
import { AiAgentService } from "../ai-agent/ai-agent.service";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies } from "@pos/database";
import { eq } from "drizzle-orm";

// ── Meta Cloud API types ──────────────────────────────────────

interface MetaWebhookBody {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }>;
      };
      field: string;
    }>;
  }>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  // Map from Meta phone_number_id → companyId (loaded from DB on first use)
  private phoneNumberToCompany = new Map<string, string>();

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly contactsService: ContactsService,
    private readonly conversationsService: ConversationsService,
    private readonly aiAgent: AiAgentService
  ) {}

  // ── Webhook verification (GET) ────────────────────────────

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    if (mode === "subscribe" && token === verifyToken) {
      this.logger.log("WhatsApp webhook verified ✅");
      return challenge;
    }
    return null;
  }

  // ── Web Gateway Handler (Local whatsapp-web.js testing) ────

  async handleWebGatewayMessage(data: {
    senderPhone: string;
    senderName: string;
    messageText: string;
  }): Promise<{ reply: string; escalated: boolean }> {
    try {
      // Find the first company (for local dev/testing)
      const [company] = await this.db.select().from(companies).limit(1);
      if (!company) {
        throw new Error("No company registered in database. Please complete onboarding.");
      }
      const companyId = company.id;

      // Get or create contact
      const contact = await this.contactsService.upsertByPhone(companyId, {
        name: data.senderName,
        phone: data.senderPhone,
        source: "whatsapp",
      });

      // Get or create conversation thread
      const conversation = await this.conversationsService.upsertConversation(
        companyId,
        contact.id,
        data.senderPhone
      );

      // Save incoming message
      await this.conversationsService.addMessage(companyId, conversation.id, {
        role: "user",
        body: data.messageText,
      });

      // Update contact last contacted
      await this.contactsService.touchLastContacted(companyId, contact.id);

      // If conversation is handled by a human agent, return manual warning
      if (conversation.status === "agent") {
        this.logger.log(`Conversation ${conversation.id} is managed by agent — skipping AI`);
        return { reply: "", escalated: false }; // Let human agent respond via CRM UI
      }

      // Process with AI Agent
      const result = await this.aiAgent.processMessage(data.messageText, {
        companyId,
        contactId: contact.id,
        conversationId: conversation.id,
        companyName: company.name,
      });

      // Save AI response
      await this.conversationsService.addMessage(companyId, conversation.id, {
        role: "assistant",
        body: result.reply,
        aiMetadata: { toolsUsed: result.toolsUsed, escalated: result.escalated },
      });

      return {
        reply: result.reply,
        escalated: result.escalated,
      };
    } catch (err: any) {
      this.logger.error(`Error in Web Gateway: ${err.message}`, err.stack);
      return {
        reply: "Lo siento, tuve un problema al procesar tu mensaje.",
        escalated: true,
      };
    }
  }

  // ── Incoming message handler (POST) ──────────────────────

  async handleWebhook(body: MetaWebhookBody): Promise<void> {
    if (body.object !== "whatsapp_business_account") return;

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;
        if (!value.messages?.length) continue;

        for (const msg of value.messages) {
          if (msg.type !== "text" || !msg.text?.body) continue;

          const phoneNumberId = value.metadata.phone_number_id;
          const senderPhone = `+${msg.from}`; // E.164 format
          const senderName = value.contacts?.[0]?.profile?.name ?? "Cliente";
          const messageText = msg.text.body;

          await this.processIncomingMessage({
            phoneNumberId,
            senderPhone,
            senderName,
            messageText,
            waMessageId: msg.id,
          });
        }
      }
    }
  }

  private async processIncomingMessage(data: {
    phoneNumberId: string;
    senderPhone: string;
    senderName: string;
    messageText: string;
    waMessageId: string;
  }) {
    try {
      // Resolve companyId from phone number ID
      const companyId = await this.resolveCompany(data.phoneNumberId);
      if (!companyId) {
        this.logger.warn(`No company found for phone_number_id: ${data.phoneNumberId}`);
        return;
      }

      // Get or create contact
      const contact = await this.contactsService.upsertByPhone(companyId, {
        name: data.senderName,
        phone: data.senderPhone,
        source: "whatsapp",
      });

      // Get or create conversation thread
      const conversation = await this.conversationsService.upsertConversation(
        companyId,
        contact.id,
        data.senderPhone
      );

      // Save incoming message
      await this.conversationsService.addMessage(companyId, conversation.id, {
        role: "user",
        body: data.messageText,
        waMessageId: data.waMessageId,
      });

      // Update contact last contacted
      await this.contactsService.touchLastContacted(companyId, contact.id);

      // If conversation is handled by a human agent, skip AI
      if (conversation.status === "agent" || conversation.status === "resolved") {
        this.logger.log(
          `Conversation ${conversation.id} is managed by agent — skipping AI`
        );
        return;
      }

      // Get company info for AI context
      const [company] = await this.db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);

      // Process with AI Agent
      const result = await this.aiAgent.processMessage(data.messageText, {
        companyId,
        contactId: contact.id,
        conversationId: conversation.id,
        companyName: company?.name ?? "Nuestro negocio",
      });

      // Save AI response
      await this.conversationsService.addMessage(companyId, conversation.id, {
        role: "assistant",
        body: result.reply,
        aiMetadata: { toolsUsed: result.toolsUsed, escalated: result.escalated },
      });

      // Send reply via Meta Cloud API
      await this.sendMessage(data.phoneNumberId, data.senderPhone, result.reply);

      if (result.escalated) {
        await this.sendMessage(
          data.phoneNumberId,
          data.senderPhone,
          "Te estamos conectando con un agente. Un momento por favor 🙏"
        );
      }

      this.logger.log(
        `✅ Responded to ${data.senderPhone} | tools: [${result.toolsUsed.join(", ")}] | escalated: ${result.escalated}`
      );
    } catch (err: any) {
      this.logger.error(`Error processing WhatsApp message: ${err.message}`, err.stack);
    }
  }

  // ── Outbound message sender ────────────────────────────────

  async sendMessage(
    phoneNumberId: string,
    to: string,
    text: string
  ): Promise<void> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!accessToken) {
      // Dev mode: just log the message
      this.logger.log(`[DEV] WhatsApp → ${to}: ${text}`);
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace("+", ""),
        type: "text",
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      this.logger.error(`WhatsApp send failed: ${JSON.stringify(err)}`);
    }
  }

  /** Map a Meta phone_number_id to a companyId via the companies table */
  private async resolveCompany(phoneNumberId: string): Promise<string | null> {
    if (this.phoneNumberToCompany.has(phoneNumberId)) {
      return this.phoneNumberToCompany.get(phoneNumberId)!;
    }

    // Look up by whatsapp_phone_number_id stored in company (future field)
    // For now: if only one company exists, use it (dev/single-tenant mode)
    const [company] = await this.db.select().from(companies).limit(1);
    if (company) {
      this.phoneNumberToCompany.set(phoneNumberId, company.id);
      return company.id;
    }

    return null;
  }
}
