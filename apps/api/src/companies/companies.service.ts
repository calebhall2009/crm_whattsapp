// ─────────────────────────────────────────────────────────────
// Companies Service — tenant CRUD
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies } from "@pos/database";
import { eq } from "drizzle-orm";
import { COUNTRY_CURRENCY, Country } from "@pos/types";

@Injectable()
export class CompaniesService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async create(data: {
    name: string;
    country: Country;
    taxId?: string;
    stripeCustomerId?: string;
  }) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const currency = COUNTRY_CURRENCY[data.country as Country];

    const [company] = await this.db
      .insert(companies)
      .values({
        name: data.name,
        slug: `${slug}-${Date.now().toString(36)}`,
        country: data.country,
        currency,
        taxId: data.taxId,
        stripeCustomerId: data.stripeCustomerId,
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3-day trial
      } as any)
      .returning();

    return company;
  }

  async findById(id: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    return company;
  }

  async update(id: string, data: { name?: string; taxId?: string }) {
    const [company] = await this.db
      .update(companies)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(companies.id, id))
      .returning();

    return company;
  }
}
