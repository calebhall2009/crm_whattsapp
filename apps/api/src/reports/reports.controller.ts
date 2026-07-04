import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CompanyId, Roles } from "../auth/decorators";

@Controller("reports")
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get("employees")
  @Roles("owner", "admin")
  async employeeActivity(
    @CompanyId() companyId: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;
    return { data: await this.service.getEmployeeActivity(companyId, dateFrom, dateTo) };
  }

  @Get("dashboard")
  @Roles("owner", "admin", "manager")
  async dashboard(@CompanyId() companyId: string) {
    return { data: await this.service.getDashboardSummary(companyId) };
  }
}
