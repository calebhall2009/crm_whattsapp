// ─────────────────────────────────────────────────────────────
// Admin Controller — API de monitoreo para el desarrollador
//
// GET  /admin/summary          → Resumen global del sistema
// GET  /admin/companies        → Lista todas las empresas
// GET  /admin/tickets          → Lista todos los tickets
// POST /admin/tickets/:id/reply → Responder un ticket
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Auth } from "../auth/decorators";
import type { AuthContext } from "../auth/jwt.guard";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("summary")
  async getSystemSummary(@Auth() auth: AuthContext) {
    return this.adminService.getSystemSummary(auth);
  }

  @Get("companies")
  async getAllCompanies(@Auth() auth: AuthContext) {
    return this.adminService.getAllCompanies(auth);
  }

  @Get("tickets")
  async getAllTickets(
    @Auth() auth: AuthContext,
    @Query("status") status?: string
  ) {
    return this.adminService.getAllTickets(auth, status);
  }

  @Post("tickets/:id/reply")
  async replyToTicket(
    @Auth() auth: AuthContext,
    @Param("id") ticketId: string,
    @Body() body: { reply: string; status?: "open" | "in_progress" | "resolved" | "closed" }
  ) {
    return this.adminService.replyToTicket(auth, ticketId, body.reply, body.status);
  }
}
