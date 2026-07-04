// ─────────────────────────────────────────────────────────────
// WhatsApp Module — Meta Cloud API integration
// ─────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { ContactsModule } from "../contacts/contacts.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { AiAgentModule } from "../ai-agent/ai-agent.module";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule, ContactsModule, ConversationsModule, AiAgentModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
