// ─────────────────────────────────────────────────────────────
// FiscalProvider Interface
//
// Adapter pattern: one implementation per country.
// Each adapter handles the specifics of its tax authority
// (XML format, digital signature, intermediary provider).
//
// For v1, all adapters are stubs with documented integration
// points. The queue + retry logic is fully functional.
// ─────────────────────────────────────────────────────────────

export interface FiscalEmitInput {
  orderId: string;
  companyId: string;
  companyTaxId: string;
  companyName: string;
  country: string;
  documentType: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }>;
  subtotal: number;
  taxTotal: number;
  total: number;
  currency: string;
}

export interface FiscalEmitResult {
  success: boolean;
  providerDocumentId?: string;
  status: "sent" | "authorized" | "rejected" | "error";
  errorMessage?: string;
  rawResponse?: unknown;
}

export interface FiscalStatusResult {
  status: "pending" | "sent" | "authorized" | "rejected" | "voided";
  providerDocumentId?: string;
  errorMessage?: string;
}

export interface FiscalVoidResult {
  success: boolean;
  errorMessage?: string;
}

export interface FiscalProvider {
  /** The country code this adapter handles */
  readonly country: string;

  /** Emit (send) a fiscal document to the tax authority */
  emit(input: FiscalEmitInput): Promise<FiscalEmitResult>;

  /** Check the current status of a previously sent document */
  getStatus(providerDocumentId: string): Promise<FiscalStatusResult>;

  /** Void/cancel a fiscal document */
  void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult>;
}
