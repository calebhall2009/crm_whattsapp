// ─────────────────────────────────────────────────────────────
// Onboarding Controller
//
// POST /onboarding — Completa datos adicionales de la empresa
// ─────────────────────────────────────────────────────────────

import { Controller, Post, Body } from "@nestjs/common";
import { OnboardingService } from "./onboarding.service";
import { Auth, CompanyId } from "../auth/decorators";

@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  /**
   * POST /onboarding
   * Actualiza datos adicionales de la empresa del usuario autenticado.
   * Ya no crea la empresa (eso lo hace /auth/register).
   */
  @Post()
  async completeProfile(
    @CompanyId() companyId: string,
    @Body()
    body: {
      vertical?: string;
      employees?: number;
      domain?: string;
    }
  ) {
    const result = await this.service.completeProfile(companyId, body);
    return {
      message: "Perfil completado exitosamente",
      ...result,
    };
  }
}
