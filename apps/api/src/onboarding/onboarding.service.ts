import { Injectable, Inject, BadRequestException, Logger } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies, users, locations } from "@pos/database";
import { eq } from "drizzle-orm";
import { COUNTRY_CURRENCY, Country } from "@pos/types";
import { CLERK_CLIENT } from "../auth/auth.module";

const COUNTRY_TIMEZONE: Record<string, string> = {
  EC: "America/Guayaquil",
};

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    @Inject(CLERK_CLIENT) private readonly clerk: any
  ) {}

  async onboard(
    clerkToken: string,
    data: {
      companyName: string;
      vertical: string;
      employees: number;
      country: string;
      domain?: string;
    }
  ) {
    let clerkUserId: string;
    try {
      // 1. Verify Clerk session token
      const payload = await this.clerk.verifyToken(clerkToken);
      clerkUserId = payload.sub;
    } catch (e) {
      throw new BadRequestException("Invalid or expired session token");
    }

    // 2. Check if user already onboarded
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser) {
      throw new BadRequestException("User has already completed onboarding");
    }

    // 3. Get user profile details from Clerk
    let clerkUser: any;
    try {
      clerkUser = await this.clerk.users.getUser(clerkUserId);
    } catch (e) {
      throw new BadRequestException("Failed to fetch user details from Clerk");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const firstName = clerkUser.firstName || "";
    const lastName = clerkUser.lastName || "";

    if (!email) {
      throw new BadRequestException("Clerk user does not have an email address");
    }

    // 4. Determine company currency and default timezone
    const country = data.country as Country;
    const currency = COUNTRY_CURRENCY[country] || "USD";
    const timezone = COUNTRY_TIMEZONE[country] || "America/Guayaquil";

    // 5. Generate unique slug and resolve corporate domain
    const slugBase = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const domain = data.domain || `${slugBase}.pos4.com`;

    // 6. Create the company and user records in a transaction
    return await this.db.transaction(async (tx) => {
      // Create Company
      const [company] = await tx
        .insert(companies)
        .values({
          name: data.companyName,
          slug,
          country,
          currency,
          domain,
          subscriptionStatus: "trialing",
          trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3-day trial
        } as any)
        .returning();

      // Create User (Owner role)
      const [user] = await tx
        .insert(users)
        .values({
          companyId: company.id,
          clerkUserId,
          role: "owner",
          firstName,
          lastName,
          email,
          isActive: true,
        } as any)
        .returning();

      // Create default location
      await tx.insert(locations).values({
        companyId: company.id,
        name: "Casa Matriz",
        timezone,
        isActive: true,
      } as any);

      // 7. Send Simulated Welcome Email
      this.simulateWelcomeEmail(email, firstName, data.companyName);

      return { company, user };
    });
  }

  private simulateWelcomeEmail(email: string, name: string, companyName: string) {
    this.logger.log(`
============================================================
📧 SIMULATED Welcome Email sent to: ${email}
Subject: ¡Te damos la bienvenida a tu Punto de Venta!

Hola ${name || "Usuario"},

¡Muchas gracias por registrarte y empezar a usar nuestro Punto de Venta (POS) para tu empresa "${companyName}"!

Queremos ayudarte a simplificar la facturación, el stock y los reportes de tu negocio.
Actualmente estás en el período de prueba gratuito de 3 días.

¿Te interesaría agendar una breve demostración para conocer más o adquirir un plan Pro/Enterprise para habilitar la facturación electrónica?

Responde a este correo y nos pondremos en contacto contigo.

Atentamente,
El Equipo de POS SaaS B2B Ecuador
============================================================
    `);
  }
}
