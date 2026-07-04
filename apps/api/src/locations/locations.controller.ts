import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { CompanyId, Roles } from "../auth/decorators";

@Controller("locations")
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  async list(@CompanyId() companyId: string) {
    return { data: await this.service.findAll(companyId) };
  }

  @Get(":id")
  async findOne(@CompanyId() companyId: string, @Param("id") id: string) {
    return { data: await this.service.findById(companyId, id) };
  }

  @Post()
  @Roles("owner", "admin")
  async create(
    @CompanyId() companyId: string,
    @Body() body: { name: string; address?: string; phone?: string; timezone?: string }
  ) {
    return { data: await this.service.create(companyId, body) };
  }

  @Put(":id")
  @Roles("owner", "admin")
  async update(
    @CompanyId() companyId: string,
    @Param("id") id: string,
    @Body() body: { name?: string; address?: string; phone?: string; timezone?: string; isActive?: boolean }
  ) {
    return { data: await this.service.update(companyId, id, body) };
  }
}
