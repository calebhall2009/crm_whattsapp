import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { FiscalService } from "./fiscal.service";
import { FiscalProcessor } from "./fiscal.processor";

// Country adapter stubs
import { EcuadorAdapter } from "./adapters/ecuador.adapter";
import { ColombiaAdapter } from "./adapters/colombia.adapter";
import { PeruAdapter } from "./adapters/peru.adapter";
import { ChileAdapter } from "./adapters/chile.adapter";
import { UsAdapter } from "./adapters/us.adapter";

@Module({
  imports: [
    BullModule.registerQueue({ name: "fiscal" }),
  ],
  providers: [
    FiscalService,
    FiscalProcessor,
    EcuadorAdapter,
    ColombiaAdapter,
    PeruAdapter,
    ChileAdapter,
    UsAdapter,
  ],
  exports: [FiscalService],
})
export class FiscalModule {}
