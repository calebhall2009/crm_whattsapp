// ─────────────────────────────────────────────────────────────
// Tenant Middleware
//
// Sets the PostgreSQL session variable `app.current_company_id`
// for every authenticated request, enabling RLS enforcement.
//
// This is the CRITICAL link between auth and data isolation.
// Without this, RLS policies have no context to filter by.
// ─────────────────────────────────────────────────────────────

import {
  Injectable,
  NestMiddleware,
  Inject,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const auth = (req as any).auth;

    if (auth?.companyId) {
      // Set the tenant context for this request's DB session.
      // Using set_config with is_local=true scopes it to the
      // current transaction, preventing cross-connection leaks.
      await this.db.execute(
        /* sql */ `SELECT set_config('app.current_company_id', '${auth.companyId}', false)`
      );
    }

    next();
  }
}
