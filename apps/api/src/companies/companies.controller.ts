// ─────────────────────────────────────────────────────────────
// Companies Controller
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Put,
  Body,
} from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { Auth, CompanyId, Roles } from "../auth/decorators";
import type { AuthContext } from "../auth/clerk.guard";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  /** Get the current user's company */
  @Get("me")
  async getMyCompany(@CompanyId() companyId: string) {
    return { data: await this.service.findById(companyId) };
  }

  /** Update company settings (owner/admin only) */
  @Put("me")
  @Roles("owner", "admin")
  async updateMyCompany(
    @CompanyId() companyId: string,
    @Body() body: { name?: string; taxId?: string }
  ) {
    return { data: await this.service.update(companyId, body) };
  }
}
