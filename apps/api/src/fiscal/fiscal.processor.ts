// ─────────────────────────────────────────────────────────────
// Fiscal Queue Processor — BullMQ worker
//
// Processes fiscal.emit jobs:
// 1. Resolves the correct country adapter
// 2. Loads the order data
// 3. Calls adapter.emit()
// 4. Updates fiscal_documents status
// 5. On failure: BullMQ retries with exponential backoff
// ─────────────────────────────────────────────────────────────

import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { fiscalDocuments, orders, companies, orderItems, items } from "@pos/database";
import { eq } from "drizzle-orm";
import type { FiscalProvider } from "./fiscal-provider.interface";

import { EcuadorAdapter } from "./adapters/ecuador.adapter";
import { ColombiaAdapter } from "./adapters/colombia.adapter";
import { PeruAdapter } from "./adapters/peru.adapter";
import { ChileAdapter } from "./adapters/chile.adapter";
import { UsAdapter } from "./adapters/us.adapter";

@Processor("fiscal")
export class FiscalProcessor extends WorkerHost {
  private readonly logger = new Logger(FiscalProcessor.name);
  private readonly adapters: Map<string, FiscalProvider>;

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    ecAdapter: EcuadorAdapter,
    coAdapter: ColombiaAdapter,
    peAdapter: PeruAdapter,
    clAdapter: ChileAdapter,
    usAdapter: UsAdapter
  ) {
    super();
    this.adapters = new Map<string, FiscalProvider>([
      ["EC", ecAdapter],
      ["CO", coAdapter],
      ["PE", peAdapter],
      ["CL", clAdapter],
      ["US", usAdapter],
    ]);
  }

  async process(job: Job) {
    const { fiscalDocumentId, orderId, companyId, country } = job.data;
    this.logger.log(
      `Processing fiscal document ${fiscalDocumentId} for order ${orderId} (${country})`
    );

    const adapter = this.adapters.get(country);
    if (!adapter) {
      this.logger.error(`No fiscal adapter found for country: ${country}`);
      throw new Error(`Unsupported country: ${country}`);
    }

    try {
      // Load order + company data
      const [order] = await this.db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      const [company] = await this.db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);

      if (!order || !company) {
        throw new Error("Order or company not found");
      }

      // Load line items
      const lineItems = await this.db
        .select({
          description: items.name,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          taxRate: items.taxRate,
          total: orderItems.lineTotal,
        })
        .from(orderItems)
        .innerJoin(items, eq(orderItems.itemId, items.id))
        .where(eq(orderItems.orderId, orderId));

      // Call the adapter
      const result = await adapter.emit({
        orderId,
        companyId,
        companyTaxId: company.taxId || "",
        companyName: company.name,
        country,
        documentType: "invoice",
        lineItems: lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: parseFloat(li.unitPrice),
          taxRate: parseFloat(li.taxRate),
          total: parseFloat(li.total),
        })),
        subtotal: parseFloat(order.subtotal),
        taxTotal: parseFloat(order.taxTotal),
        total: parseFloat(order.total),
        currency: company.currency,
      });

      // Update the fiscal document record
      await this.db
        .update(fiscalDocuments)
        .set({
          status: result.status === "authorized" ? "authorized" : "sent",
          providerDocumentId: result.providerDocumentId,
          errorMessage: result.errorMessage,
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
          ...(result.status === "authorized" ? { authorizedAt: new Date() } : {}),
        } as any)
        .where(eq(fiscalDocuments.id, fiscalDocumentId));

      this.logger.log(
        `Fiscal document ${fiscalDocumentId} processed: ${result.status}`
      );
    } catch (error) {
      // Update attempt count and error
      await this.db
        .update(fiscalDocuments)
        .set({
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
          errorMessage: (error as Error).message,
        } as any)
        .where(eq(fiscalDocuments.id, fiscalDocumentId));

      this.logger.error(
        `Failed to process fiscal document ${fiscalDocumentId}: ${(error as Error).message}`
      );
      throw error; // Re-throw so BullMQ retries
    }
  }
}
