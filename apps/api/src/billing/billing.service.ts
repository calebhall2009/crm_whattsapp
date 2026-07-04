// ─────────────────────────────────────────────────────────────
// Billing Service — Stripe implementation
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject, Logger } from "@nestjs/common";
import Stripe from "stripe";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies } from "@pos/database";
import { eq } from "drizzle-orm";

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {
    const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_to_avoid_startup_crash_1234567890";
    if (!process.env.STRIPE_SECRET_KEY) {
      this.logger.warn("STRIPE_SECRET_KEY is not set — using dummy mock key for startup");
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: "2025-02-24.acacia",
    });
  }

  async createCustomer(data: { email: string; name: string; companyId: string }) {
    const customer = await this.stripe.customers.create({
      email: data.email,
      name: data.name,
      metadata: { companyId: data.companyId },
    });

    // Save Stripe customer ID to company
    await this.db
      .update(companies)
      .set({ stripeCustomerId: customer.id } as any)
      .where(eq(companies.id, data.companyId));

    return customer.id;
  }

  async createTrialSubscription(customerId: string, priceId: string) {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 3,
      trial_settings: {
        end_behavior: {
          missing_payment_method: "cancel",
        },
      },
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    };
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_collection: "if_required",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 3,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session.url!;
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = (sub.metadata as any)?.companyId;
        if (companyId) {
          await this.db
            .update(companies)
            .set({
              subscriptionStatus: sub.status as any,
              updatedAt: new Date(),
            } as any)
            .where(eq(companies.id, companyId));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = (sub.metadata as any)?.companyId;
        if (companyId) {
          await this.db
            .update(companies)
            .set({ subscriptionStatus: "canceled", updatedAt: new Date() } as any)
            .where(eq(companies.id, companyId));
        }
        break;
      }
      case "invoice.payment_failed": {
        this.logger.warn(`Payment failed for invoice ${(event.data.object as any).id}`);
        break;
      }
    }

    return { event: event.type, data: event.data.object };
  }

  async cancelSubscription(subscriptionId: string) {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }
}
