// ─────────────────────────────────────────────────────────────
// BillingProvider Interface — abstracting payment providers
//
// Stripe is the default for US-based entities.
// For LATAM countries where Stripe doesn't support direct
// merchant accounts, swap this with a regional provider
// (Kushki, PayU, Mercado Pago) via configuration.
// ─────────────────────────────────────────────────────────────

export interface BillingProvider {
  createCustomer(data: { email: string; name: string; companyId: string }): Promise<string>;
  createTrialSubscription(customerId: string, planId: string): Promise<{
    subscriptionId: string;
    status: string;
    trialEnd: Date | null;
  }>;
  createCheckoutSession(customerId: string, planId: string, successUrl: string, cancelUrl: string): Promise<string>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  handleWebhook(payload: Buffer, signature: string): Promise<{ event: string; data: any }>;
}
