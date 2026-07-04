// ─────────────────────────────────────────────────────────────
// WhatsApp Controller — Meta Cloud API Webhook
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { WhatsAppService } from "./whatsapp.service";
import { Public } from "../auth/decorators";

@Controller("whatsapp")
export class WhatsAppController {
  constructor(private readonly service: WhatsAppService) {}

  /**
   * Meta webhook verification — GET request
   * Meta sends this to verify the webhook endpoint is valid
   */
  @Get("webhook")
  @Public()
  verifyWebhook(
    @Query("hub.mode") mode: string,
    @Query("hub.verify_token") token: string,
    @Query("hub.challenge") challenge: string,
    @Res() res: Response
  ) {
    const result = this.service.verifyWebhook(mode, token, challenge);
    if (result) {
      return res.status(200).send(result);
    }
    return res.status(403).send("Forbidden");
  }

  /**
   * Meta webhook event — POST request
   * Receives incoming WhatsApp messages and status updates
   */
  @Post("webhook")
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(@Body() body: any) {
    // Always respond 200 immediately — Meta will retry if we take too long.
    // Process webhook in the background.
    this.service.handleWebhook(body).catch((err) => {
      console.error("WhatsApp webhook processing error:", err);
    });
    return { status: "ok" };
  }

  /**
   * Web Gateway event — POST request
   * Receives incoming WhatsApp messages from local whatsapp-web.js
   */
  @Post("web-gateway")
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebGateway(
    @Body()
    body: {
      senderPhone: string;
      senderName: string;
      messageText: string;
    }
  ) {
    return this.service.handleWebGatewayMessage(body);
  }
}
