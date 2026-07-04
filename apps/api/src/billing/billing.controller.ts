import { Controller, Post, Body, Req, Headers } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { Public, CompanyId, Roles } from "../auth/decorators";

@Controller("billing")
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Post("checkout")
  @Roles("owner")
  async createCheckout(
    @CompanyId() companyId: string,
    @Body() body: { priceId: string; successUrl: string; cancelUrl: string }
  ) {
    // In production: look up company's Stripe customer ID
    const customerId = "cus_placeholder"; // Will be set during onboarding
    const url = await this.service.createCheckoutSession(
      customerId,
      body.priceId,
      body.successUrl,
      body.cancelUrl
    );
    return { data: { url } };
  }

  @Post("webhooks/stripe")
  @Public() // Webhooks don't have auth context
  async handleWebhook(
    @Req() req: any,
    @Headers("stripe-signature") signature: string
  ) {
    const result = await this.service.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
