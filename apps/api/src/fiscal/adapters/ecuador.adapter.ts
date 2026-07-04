// ─────────────────────────────────────────────────────────────
// Ecuador Fiscal Adapter — Stub
//
// Tax authority: SRI (Servicio de Rentas Internas)
// Recommended intermediary: Gosocket (certified as "Emisor
// Autorizado" by SRI)
//
// Document format: XML as per SRI technical specs
// Digital signature: .p12 certificate required
// Authorization: Real-time via SRI webservice
//
// Integration steps when ready:
// 1. Obtain Gosocket account + API credentials
// 2. Configure .p12 certificate in env vars
// 3. Implement XML generation per SRI schema (factura,
//    nota de crédito, nota de débito, guía de remisión,
//    comprobante de retención)
// 4. Send via Gosocket REST API → Gosocket handles SRI
//    submission and returns authorization number (clave
//    de acceso de 49 dígitos)
//
// SRI-specific notes:
// - Clave de acceso = 49-digit unique identifier
// - Ambiente: 1 = pruebas, 2 = producción
// - Tipo de emisión: 1 = normal
// - IVA rates: 0%, 12%, 15% (check current rates)
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
export class EcuadorAdapter implements FiscalProvider {
  readonly country = "EC";

  async emit(input: FiscalEmitInput): Promise<FiscalEmitResult> {
    // STUB: Replace with Gosocket API call
    console.log(`[EC Fiscal Stub] Would emit document for order ${input.orderId}`);
    console.log(`[EC Fiscal Stub] Company RUC: ${input.companyTaxId}`);
    console.log(`[EC Fiscal Stub] Total: $${input.total} ${input.currency}`);

    return {
      success: true,
      status: "sent",
      providerDocumentId: `EC-STUB-${Date.now()}`,
      errorMessage: "STUB: Gosocket integration pending. Document recorded locally.",
    };
  }

  async getStatus(providerDocumentId: string): Promise<FiscalStatusResult> {
    return {
      status: "pending",
      providerDocumentId,
      errorMessage: "STUB: Gosocket integration pending.",
    };
  }

  async void(providerDocumentId: string, reason: string): Promise<FiscalVoidResult> {
    console.log(`[EC Fiscal Stub] Would void ${providerDocumentId}: ${reason}`);
    return {
      success: true,
      errorMessage: "STUB: Void not yet implemented.",
    };
  }
}
