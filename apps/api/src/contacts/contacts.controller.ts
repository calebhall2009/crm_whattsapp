// ─────────────────────────────────────────────────────────────
// Contacts Controller
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ContactsService } from "./contacts.service";
import { CompanyId, Auth, Roles } from "../auth/decorators";
import type { AuthContext } from "../auth/jwt.guard";

@Controller("contacts")
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  /** List contacts — agents see all or only their own based on role */
  @Get()
  async list(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("assignedTo") assignedTo?: string
  ) {
    // Cashiers (agents) only see their own contacts
    const effectiveAssignedTo =
      auth.role === "cashier" ? auth.userId : assignedTo;

    const data = await this.service.findAll(companyId, {
      search,
      status,
      assignedTo: effectiveAssignedTo,
    });
    return { data };
  }

  /** Get a single contact */
  @Get(":id")
  async findOne(@CompanyId() companyId: string, @Param("id") id: string) {
    return { data: await this.service.findById(companyId, id) };
  }

  /** Create a contact manually */
  @Post()
  async create(
    @CompanyId() companyId: string,
    @Body()
    body: {
      name: string;
      phone: string;
      email?: string;
      source?: "whatsapp" | "manual" | "import" | "referral" | "web";
      assignedTo?: string;
      tags?: string[];
      notes?: string;
    }
  ) {
    return { data: await this.service.create(companyId, body) };
  }

  /** Update a contact */
  @Put(":id")
  async update(
    @CompanyId() companyId: string,
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      email?: string;
      status?: "new" | "contacted" | "qualified" | "proposal" | "closed_won" | "closed_lost";
      assignedTo?: string | null;
      tags?: string[];
      notes?: string;
      nextFollowUpAt?: string;
    }
  ) {
    return { data: await this.service.update(companyId, id, body) };
  }

  /** Delete a contact (owner/admin only) */
  @Delete(":id")
  @Roles("owner", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CompanyId() companyId: string, @Param("id") id: string) {
    await this.service.delete(companyId, id);
  }
}
