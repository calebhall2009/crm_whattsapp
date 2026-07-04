// ─────────────────────────────────────────────────────────────
// Peru Fiscal Adapter — Stub
//
// Tax authority: SUNAT (Superintendencia Nacional de Aduanas
// y de Administración Tributaria)
// Recommended intermediary: Gosocket (authorized OSE —
// Operador de Servicios Electrónicos)
//
// Document format: UBL 2.1 (XML)
// Digital signature: X.509 certificate (SUNAT approved CA)
// Authorization: Via OSE → SUNAT CDR (Constancia de Recepción)
//
// Integration steps when ready:
// 1. Obtain Gosocket OSE account + API credentials
// 2. Configure X.509 certificate from SUNAT-approved CA
// 3. Implement UBL 2.1 XML per SUNAT Anexo N° 9:
//    - Factura (01), Boleta de Venta (03)
//    - Nota de Crédito (07), Nota de Débito (08)
// 4. Send via Gosocket → validates → submits to SUNAT
// 5. SUNAT returns CDR with acceptance/rejection
//
// Peru-specific notes:
// - RUC = 11-digit tax ID
// - IGV: 18% (Impuesto General a las Ventas)
// - Series: F001 (factura), B001 (boleta)
// - Hash resumen required in printed representation
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
export class PeruAdapter implements FiscalProvider {
  readonly country = "PE";

  async emit(input: FiscalEmitInput): Promise<FiscalEmitResult> {
    console.log(`[PE Fiscal Stub] Would emit UBL 2.1 document for order ${input.orderId}`);
    console.log(`[PE Fiscal Stub] Company RUC: ${input.companyTaxId}`);

    return {
      success: true,
      status: "sent",
      providerDocumentId: `PE-STUB-${Date.now()}`,
      errorMessage: "STUB: Gosocket OSE/SUNAT integration pending. UBL 2.1 format required.",
    };
  }

  async getStatus(providerDocumentId: string): Promise<FiscalStatusResult> {
    return {
      status: "pending",
      providerDocumentId,
      errorMessage: "STUB: SUNAT CDR validation pending.",
    };
  }

  async void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult> {
    return { success: true, errorMessage: "STUB: Void via nota de crédito not yet implemented." };
  }
}
