// ─────────────────────────────────────────────────────────────
// Onboarding Service
//
// El registro ya no pasa por aquí (ahora es AuthService.register).
// Este servicio maneja la actualización de datos adicionales de
// la empresa después del registro inicial (vertical, empleados, etc.)
// ─────────────────────────────────────────────────────────────

import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { companies, locations } from "@pos/database";
import { eq } from "drizzle-orm";

const COUNTRY_TIMEZONE: Record<string, string> = {
  EC: "America/Guayaquil",
  CO: "America/Bogota",
  PE: "America/Lima",
  CL: "America/Santiago",
  US: "America/New_York",
};

@Injectable()
export class OnboardingService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Completa el perfil de la empresa con datos adicionales.
   * Se llama después de que el usuario ya se registró.
   */
  async completeProfile(
    companyId: string,
    data: {
      vertical?: string;
      employees?: number;
      domain?: string;
    }
  ) {
    if (!companyId) {
      throw new BadRequestException("No tienes una empresa asociada a tu cuenta.");
    }

    // Verificar que la empresa existe
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      throw new BadRequestException("Empresa no encontrada.");
    }

    // Actualizar datos opcionales de la empresa
    const updateData: any = {};
    if (data.domain?.trim()) {
      updateData.domain = data.domain.trim();
    }

    if (Object.keys(updateData).length > 0) {
      await this.db
        .update(companies)
        .set(updateData)
        .where(eq(companies.id, companyId));
    }

    return { success: true, companyId };
  }
}
