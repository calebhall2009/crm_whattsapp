// ─────────────────────────────────────────────────────────────
// Colombia Fiscal Adapter — Stub
//
// Tax authority: DIAN (Dirección de Impuestos y Aduanas
// Nacionales)
// Recommended intermediary: Gosocket (homologated as
// "Proveedor Tecnológico" by DIAN)
//
// Document format: UBL 2.1 (XML)
// Digital signature: X.509 certificate
// Authorization: Async — DIAN validates and returns CUFE
// (Código Único de Facturación Electrónica)
//
// Integration steps when ready:
// 1. Obtain Gosocket account + API credentials for Colombia
// 2. Configure X.509 certificate
// 3. Implement UBL 2.1 XML generation per DIAN Anexo Técnico
//    - Factura electrónica de venta
//    - Nota crédito
//    - Nota débito
// 4. Send via Gosocket API → Gosocket validates UBL, signs,
//    and submits to DIAN
// 5. DIAN returns CUFE for authorized documents
//
// Colombia-specific notes:
// - NIT = tax ID (Número de Identificación Tributaria)
// - IVA: 19% standard rate
// - Resolución de facturación required (prefix + ranges)
// - CUFE = 96-char SHA384 hash, unique per document
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
export class ColombiaAdapter implements FiscalProvider {
  readonly country = "CO";

  async emit(input: FiscalEmitInput): Promise<FiscalEmitResult> {
    console.log(`[CO Fiscal Stub] Would emit UBL 2.1 document for order ${input.orderId}`);
    console.log(`[CO Fiscal Stub] Company NIT: ${input.companyTaxId}`);

    return {
      success: true,
      status: "sent",
      providerDocumentId: `CO-STUB-${Date.now()}`,
      errorMessage: "STUB: Gosocket/DIAN integration pending. UBL 2.1 format required.",
    };
  }

  async getStatus(providerDocumentId: string): Promise<FiscalStatusResult> {
    return {
      status: "pending",
      providerDocumentId,
      errorMessage: "STUB: DIAN CUFE validation pending.",
    };
  }

  async void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult> {
    return { success: true, errorMessage: "STUB: Void via nota crédito not yet implemented." };
  }
}
