// ─────────────────────────────────────────────────────────────
// Conversations Controller — Bandeja unificada de WhatsApp
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { CompanyId, Auth, Roles } from "../auth/decorators";
import type { AuthContext } from "../auth/clerk.guard";

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly service: ConversationsService) {}

  @Get()
  async list(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Query("status") status?: string
  ) {
    const assignedTo = auth.role === "cashier" ? auth.userId : undefined;
    return { data: await this.service.findAll(companyId, { status, assignedTo }) };
  }

  @Get(":id/messages")
  async getMessages(
    @CompanyId() companyId: string,
    @Param("id") conversationId: string
  ) {
    return { data: await this.service.getMessages(companyId, conversationId) };
  }

  /** Agent sends a manual message to the client */
  @Post(":id/messages")
  async sendMessage(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Param("id") conversationId: string,
    @Body() body: { message: string }
  ) {
    const msg = await this.service.addMessage(companyId, conversationId, {
      role: "agent",
      body: body.message,
    });
    // TODO: actually send via WhatsApp API (handled by WhatsApp module)
    return { data: msg };
  }

  /** Take over conversation from bot — assign to human agent */
  @Post(":id/assign")
  async assignToAgent(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Param("id") conversationId: string,
    @Body() body: { agentId?: string }
  ) {
    const agentId = body.agentId ?? auth.userId;
    return { data: await this.service.assignToAgent(companyId, conversationId, agentId) };
  }

  /** Mark conversation as resolved */
  @Post(":id/resolve")
  async resolve(
    @CompanyId() companyId: string,
    @Param("id") conversationId: string
  ) {
    return { data: await this.service.resolve(companyId, conversationId) };
  }
}
