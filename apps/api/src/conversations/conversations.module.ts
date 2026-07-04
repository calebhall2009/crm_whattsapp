// ─────────────────────────────────────────────────────────────
// Conversations Module
// ─────────────────────────────────────────────────────────────

import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { DatabaseModule } from "../database/database.module";
import { ContactsModule } from "../contacts/contacts.module";

@Module({
  imports: [DatabaseModule, ContactsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
