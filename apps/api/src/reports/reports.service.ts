import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { orders, orderItems, users, auditLog, withTenantTransaction } from "@pos/database";
import { eq, and, gte, sql, desc } from "drizzle-orm";

@Injectable()
export class ReportsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  /**
   * Employee activity report — per-employee metrics:
   * total sales, avg ticket, discounts applied, voids, session hours
   */
  async getEmployeeActivity(companyId: string, dateFrom?: Date, dateTo?: Date) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const result = await tx.execute(sql`
        SELECT
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.role,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as total_sales,
          COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total::numeric END), 0) as total_revenue,
          CASE
            WHEN COUNT(CASE WHEN o.status = 'completed' THEN 1 END) > 0
            THEN COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total::numeric END), 0) /
                 COUNT(CASE WHEN o.status = 'completed' THEN 1 END)
            ELSE 0
          END as average_ticket,
          COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.discount_total::numeric END), 0) as total_discount_amount,
          COUNT(CASE WHEN o.status = 'completed' AND o.discount_total::numeric > 0 THEN 1 END) as discounts_applied,
          COUNT(CASE WHEN o.status = 'voided' THEN 1 END) as voided_orders,
          EXTRACT(EPOCH FROM (
            COALESCE(MAX(o.created_at), NOW()) - COALESCE(MIN(o.created_at), NOW())
          )) / 3600 as session_hours
        FROM users u
        LEFT JOIN orders o ON o.cashier_id = u.id
          ${dateFrom ? sql`AND o.created_at >= ${dateFrom}` : sql``}
          ${dateTo ? sql`AND o.created_at <= ${dateTo}` : sql``}
        WHERE u.company_id = ${companyId}
        GROUP BY u.id, u.first_name, u.last_name, u.role
        ORDER BY total_revenue DESC
      `);

      return result;
    });
  }

  /**
   * Dashboard summary — today's key metrics
   */
  async getDashboardSummary(companyId: string) {
    return withTenantTransaction(this.db, companyId, async (tx) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await tx.execute(sql`
        SELECT
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as today_sales,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total::numeric END), 0) as today_revenue,
          CASE
            WHEN COUNT(CASE WHEN status = 'completed' THEN 1 END) > 0
            THEN COALESCE(SUM(CASE WHEN status = 'completed' THEN total::numeric END), 0) /
                 COUNT(CASE WHEN status = 'completed' THEN 1 END)
            ELSE 0
          END as today_average_ticket,
          COUNT(CASE WHEN status = 'voided' THEN 1 END) as today_voids
        FROM orders
        WHERE company_id = ${companyId}
          AND created_at >= ${today}
      `);

      // Top selling items today
      const topItems = await tx.execute(sql`
        SELECT
          i.id as item_id,
          i.name as item_name,
          SUM(oi.quantity) as quantity
        FROM order_items oi
        JOIN items i ON i.id = oi.item_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.company_id = ${companyId}
          AND o.status = 'completed'
          AND o.created_at >= ${today}
        GROUP BY i.id, i.name
        ORDER BY quantity DESC
        LIMIT 10
      `);

      // Active employees today
      const activeEmployees = await tx.execute(sql`
        SELECT COUNT(DISTINCT cashier_id) as count
        FROM orders
        WHERE company_id = ${companyId}
          AND created_at >= ${today}
      `);

      return {
        ...((result as any)[0] || {}),
        topSellingItems: topItems,
        activeEmployees: (activeEmployees as any)[0]?.count || 0,
      };
    });
  }
}
