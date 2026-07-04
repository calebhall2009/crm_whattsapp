import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { auditLog } from "@pos/database";

@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async log(entry: {
    companyId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.db.insert(auditLog).values(entry);
  }
}
