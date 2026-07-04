// ─────────────────────────────────────────────────────────────
// AI Agent Module
// ─────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { AiAgentService } from "./ai-agent.service";
import { DatabaseModule } from "../database/database.module";
import { ContactsModule } from "../contacts/contacts.module";
import { ConversationsModule } from "../conversations/conversations.module";

@Module({
  imports: [DatabaseModule, ContactsModule, ConversationsModule],
  providers: [AiAgentService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
