import { Controller, Get, Post, Put, Param, Body, Query } from "@nestjs/common";
import { ItemsService } from "./items.service";
import { CompanyId, Roles } from "../auth/decorators";

@Controller("items")
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Get()
  async list(@CompanyId() companyId: string, @Query("type") type?: string) {
    return { data: await this.service.findAll(companyId, type) };
  }

  @Get(":id")
  async findOne(@CompanyId() companyId: string, @Param("id") id: string) {
    return { data: await this.service.findById(companyId, id) };
  }

  @Post()
  @Roles("owner", "admin", "manager")
  async create(
    @CompanyId() companyId: string,
    @Body() body: {
      type: string;
      name: string;
      description?: string;
      sku?: string;
      price: number;
      taxRate?: number;
      trackStock?: boolean;
      currentStock?: number;
      durationMinutes?: number;
      modifiers?: Array<{ name: string; priceAdjustment: number; isRequired?: boolean }>;
      staffUserIds?: string[];
    }
  ) {
    return { data: await this.service.create(companyId, body) };
  }

  @Put(":id")
  @Roles("owner", "admin", "manager")
  async update(
    @CompanyId() companyId: string,
    @Param("id") id: string,
    @Body() body: {
      name?: string;
      description?: string;
      sku?: string;
      price?: number;
      taxRate?: number;
      isActive?: boolean;
      trackStock?: boolean;
      currentStock?: number;
      durationMinutes?: number;
    }
  ) {
    return { data: await this.service.update(companyId, id, body) };
  }
}
