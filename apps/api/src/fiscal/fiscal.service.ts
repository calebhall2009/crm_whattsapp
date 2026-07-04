// ─────────────────────────────────────────────────────────────
// Fiscal Service — orchestrates fiscal document creation
// and queues async processing via BullMQ
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { fiscalDocuments } from "@pos/database";

@Injectable()
export class FiscalService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    @InjectQueue("fiscal") private readonly fiscalQueue: Queue
  ) {}

  /**
   * Queue a fiscal document for async processing.
   * The order is NEVER blocked waiting for fiscal authorization.
   * If the provider is down, the job retries with exponential backoff.
   */
  async queueFiscalDocument(data: {
    orderId: string;
    companyId: string;
    country: string;
    documentType?: string;
  }) {
    // Create the fiscal document record first (status: pending)
    const [doc] = await this.db
      .insert(fiscalDocuments)
      .values({
        orderId: data.orderId,
        companyId: data.companyId,
        country: data.country as any,
        documentType: (data.documentType as any) || "invoice",
        status: "pending",
      } as any)
      .returning();

    // Queue the job for async processing
    await this.fiscalQueue.add(
      "emit",
      {
        fiscalDocumentId: doc.id,
        orderId: data.orderId,
        companyId: data.companyId,
        country: data.country,
      },
      {
        attempts: 10,
        backoff: {
          type: "exponential",
          delay: 5000, // Start at 5s, then 10s, 20s, 40s...
        },
        removeOnComplete: 100, // Keep last 100 completed for debugging
        removeOnFail: 500, // Keep last 500 failed for analysis
      }
    );

    return doc;
  }
}
