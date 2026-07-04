// ─────────────────────────────────────────────────────────────
// Chile Fiscal Adapter — Stub
//
// Tax authority: SII (Servicio de Impuestos Internos)
// Recommended intermediary: Gosocket (authorized as
// "Proveedor de Facturación Electrónica")
//
// Document format: XML (SII-specific schema, NOT UBL)
// Digital signature: X.509 certificate issued by
// SII-approved CA (e.g., E-Sign, CertificateChile)
// Authorization: Real-time via SII webservice
//
// Integration steps when ready:
// 1. Obtain Gosocket account + API credentials for Chile
// 2. Configure X.509 digital certificate
// 3. Implement XML per SII DTE (Documento Tributario
//    Electrónico) schema:
//    - Factura Electrónica (33)
//    - Factura Exenta Electrónica (34)
//    - Nota de Crédito Electrónica (61)
//    - Nota de Débito Electrónica (56)
// 4. Send via Gosocket → signs and submits to SII
// 5. SII returns track ID for acceptance check
//
// Chile-specific notes:
// - RUT = tax ID (Rol Único Tributario), format XX.XXX.XXX-X
// - IVA: 19%
// - Folios (CAF) required: pre-authorized invoice number ranges
// - Timbre electrónico (PDF417 barcode) on printed docs
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
export class ChileAdapter implements FiscalProvider {
  readonly country = "CL";

  async emit(input: FiscalEmitInput): Promise<FiscalEmitResult> {
    console.log(`[CL Fiscal Stub] Would emit DTE for order ${input.orderId}`);
    console.log(`[CL Fiscal Stub] Company RUT: ${input.companyTaxId}`);

    return {
      success: true,
      status: "sent",
      providerDocumentId: `CL-STUB-${Date.now()}`,
      errorMessage: "STUB: Gosocket/SII integration pending. DTE XML format required.",
    };
  }

  async getStatus(providerDocumentId: string): Promise<FiscalStatusResult> {
    return {
      status: "pending",
      providerDocumentId,
      errorMessage: "STUB: SII track ID validation pending.",
    };
  }

  async void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult> {
    return { success: true, errorMessage: "STUB: Void via nota de crédito not yet implemented." };
  }
}
