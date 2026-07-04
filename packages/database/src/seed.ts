// ─────────────────────────────────────────────────────────────
// Seed script — creates test data for local development
// ─────────────────────────────────────────────────────────────

import { createDatabase, withAdminTransaction } from "./client";
import { companies, locations, users, items } from "./schema";

const SEED_COMPANY_ID = "00000000-0000-0000-0000-000000000001";
const SEED_LOCATION_ID = "00000000-0000-0000-0000-000000000010";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const { db, sql } = createDatabase(databaseUrl);

  try {
    await withAdminTransaction(db, async (tx) => {
      console.log("🌱 Seeding database...");

      // ── Company ─────────────────────────────────────────────
      await tx.insert(companies).values({
        id: SEED_COMPANY_ID,
        name: "Demo Business",
        slug: "demo-business",
        country: "EC",
        currency: "USD",
        taxId: "0991234567001",
        subscriptionStatus: "trialing",
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      }).onConflictDoNothing();

      // ── Location ────────────────────────────────────────────
      await tx.insert(locations).values({
        id: SEED_LOCATION_ID,
        companyId: SEED_COMPANY_ID,
        name: "Main Store",
        address: "Av. 9 de Octubre 100, Guayaquil",
        phone: "+593-4-2000000",
        timezone: "America/Guayaquil",
      }).onConflictDoNothing();

      // ── Owner User ──────────────────────────────────────────
      await tx.insert(users).values({
        id: "00000000-0000-0000-0000-000000000100",
        companyId: SEED_COMPANY_ID,
        clerkUserId: "clerk_seed_owner",
        role: "owner",
        firstName: "Carlos",
        lastName: "Mendoza",
        email: "owner@demo.com",
      }).onConflictDoNothing();

      // ── Cashier User ────────────────────────────────────────
      await tx.insert(users).values({
        id: "00000000-0000-0000-0000-000000000101",
        companyId: SEED_COMPANY_ID,
        clerkUserId: "clerk_seed_cashier",
        role: "cashier",
        locationId: SEED_LOCATION_ID,
        firstName: "María",
        lastName: "López",
        email: "cashier@demo.com",
      }).onConflictDoNothing();

      // ── Sample Items ────────────────────────────────────────
      await tx.insert(items).values([
        {
          companyId: SEED_COMPANY_ID,
          type: "product",
          name: "Camiseta básica",
          description: "Camiseta de algodón talla M",
          sku: "CAM-BAS-M",
          price: "12.99",
          taxRate: "0.1200",
          trackStock: true,
          currentStock: 50,
        },
        {
          companyId: SEED_COMPANY_ID,
          type: "product",
          name: "Pantalón jean",
          description: "Jean clásico corte recto",
          sku: "PAN-JEA-32",
          price: "29.99",
          taxRate: "0.1200",
          trackStock: true,
          currentStock: 30,
        },
        {
          companyId: SEED_COMPANY_ID,
          type: "menu_item",
          name: "Hamburguesa clásica",
          description: "Carne 200g, lechuga, tomate, queso",
          price: "8.50",
          taxRate: "0.1200",
        },
        {
          companyId: SEED_COMPANY_ID,
          type: "menu_item",
          name: "Cerveza artesanal",
          description: "Pilsner local 330ml",
          price: "4.00",
          taxRate: "0.1200",
        },
        {
          companyId: SEED_COMPANY_ID,
          type: "service",
          name: "Corte de cabello",
          description: "Corte clásico con lavado",
          price: "15.00",
          taxRate: "0.1200",
          durationMinutes: 45,
        },
      ]).onConflictDoNothing();

      console.log("✅ Seed data inserted successfully");
    });
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
