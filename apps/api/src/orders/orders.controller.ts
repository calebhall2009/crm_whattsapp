import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { Auth, CompanyId, Roles } from "../auth/decorators";
import type { AuthContext } from "../auth/clerk.guard";

@Controller("orders")
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  async list(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Query("status") status?: string
  ) {
    // Cashiers can only see their own orders
    const cashierId = auth.role === "cashier" ? auth.userId : undefined;
    return { data: await this.service.findAll(companyId, { status, cashierId }) };
  }

  @Get(":id")
  async findOne(@CompanyId() companyId: string, @Param("id") id: string) {
    return { data: await this.service.findById(companyId, id) };
  }

  @Post()
  async create(
    @CompanyId() companyId: string,
    @Auth() auth: AuthContext,
    @Body() body: { locationId: string; notes?: string }
  ) {
    return {
      data: await this.service.create(companyId, {
        ...body,
        cashierId: auth.userId,
      }),
    };
  }

  @Post(":id/items")
  async addItem(
    @CompanyId() companyId: string,
    @Param("id") orderId: string,
    @Body() body: {
      itemId: string;
      quantity: number;
      modifiers?: Record<string, unknown>;
      discountAmount?: number;
      discountReason?: string;
    }
  ) {
    return { data: await this.service.addItem(companyId, orderId, body) };
  }

  @Post(":id/complete")
  async complete(
    @CompanyId() companyId: string,
    @Param("id") orderId: string,
    @Body() body: {
      payments: Array<{ method: string; amount: number; reference?: string }>;
    }
  ) {
    return { data: await this.service.complete(companyId, orderId, body.payments) };
  }

  @Post(":id/void")
  @Roles("owner", "admin", "manager")
  async voidOrder(
    @CompanyId() companyId: string,
    @Param("id") orderId: string,
    @Body() body: { reason: string }
  ) {
    return { data: await this.service.void(companyId, orderId, body.reason) };
  }
}
