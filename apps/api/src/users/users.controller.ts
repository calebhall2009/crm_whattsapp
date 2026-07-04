import {
  Controller, Get, Post, Put, Param, Body,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CompanyId, Roles } from "../auth/decorators";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @Roles("owner", "admin", "manager")
  async list(@CompanyId() companyId: string) {
    return { data: await this.service.findAllByCompany(companyId) };
  }

  @Get(":id")
  @Roles("owner", "admin", "manager")
  async findOne(
    @CompanyId() companyId: string,
    @Param("id") id: string
  ) {
    return { data: await this.service.findById(companyId, id) };
  }

  @Post("invite")
  @Roles("owner", "admin")
  async invite(
    @CompanyId() companyId: string,
    @Body() body: {
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      locationId?: string;
    }
  ) {
    // In production, this would also send a Clerk invitation email
    const user = await this.service.create(companyId, {
      clerkUserId: `pending_${Date.now()}`, // Placeholder until Clerk invite is accepted
      ...body,
    });
    return { data: user };
  }

  @Put(":id")
  @Roles("owner", "admin")
  async update(
    @CompanyId() companyId: string,
    @Param("id") id: string,
    @Body() body: { role?: string; locationId?: string | null; isActive?: boolean }
  ) {
    return { data: await this.service.update(companyId, id, body) };
  }
}
