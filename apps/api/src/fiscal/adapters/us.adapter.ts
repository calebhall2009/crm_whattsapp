// ─────────────────────────────────────────────────────────────
// US Fiscal Adapter — Stub
//
// The United States does NOT have a federal electronic
// invoicing mandate for POS transactions. However:
//
// - Sales tax is fragmented across 50 states, ~12,000
//   jurisdictions, with rates varying by state, county,
//   city, and product category
// - Tax calculation is best delegated to a specialized
//   service rather than maintained manually
//
// Recommended integration: Stripe Tax, Avalara, or TaxJar
//
// Integration steps when ready:
// 1. Create Stripe Tax or Avalara account
// 2. Configure API key in env vars
// 3. On each sale, call the tax API with:
//    - Seller location (nexus state)
//    - Buyer location (shipping/billing address)
//    - Product tax codes
// 4. Apply calculated tax to the order
// 5. For record keeping: store tax breakdown per jurisdiction
//
// US-specific notes:
// - No XML/digital signature requirements for POS receipts
// - EIN (Employer Identification Number) = federal tax ID
// - Some states have no sales tax (OR, MT, NH, DE, AK)
// - Economic nexus thresholds vary by state
// ─────────────────────────────────────────────────────────────

import { Injectable } from "@nestjs/common";
import type {
  FiscalProvider,
  FiscalEmitInput,
  FiscalEmitResult,
  FiscalStatusResult,
  FiscalVoidResult,
} from "../fiscal-provider.interface";

@Injectable()
export class UsAdapter implements FiscalProvider {
  readonly country = "US";

  async emit(input: FiscalEmitInput): Promise<FiscalEmitResult> {
    // US doesn't require electronic fiscal documents at POS level.
    // This adapter is a pass-through that records the sale internally.
    console.log(`[US Fiscal Stub] No e-invoice required. Order ${input.orderId} recorded.`);
    console.log(`[US Fiscal Stub] Sales tax calculation via Stripe Tax pending.`);

    return {
      success: true,
      status: "authorized", // Auto-authorized since no e-invoice required
      providerDocumentId: `US-RECEIPT-${Date.now()}`,
    };
  }

  async getStatus(providerDocumentId: string): Promise<FiscalStatusResult> {
    return {
      status: "authorized",
      providerDocumentId,
    };
  }

  async void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult> {
    return { success: true }; // No fiscal void needed in US
  }
}
