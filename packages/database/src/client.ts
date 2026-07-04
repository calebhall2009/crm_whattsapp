// ─────────────────────────────────────────────────────────────
// Database client factory
//
// Creates a Drizzle ORM instance connected to PostgreSQL via
// postgres.js. Provides helpers to wrap queries in a tenant-
// scoped transaction (SET LOCAL app.current_company_id).
// ─────────────────────────────────────────────────────────────

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { setTenantContextSql, setAdminBypassSql } from "./rls";

export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Create a postgres.js connection and wrap it with Drizzle.
 *
 * @param connectionString - PostgreSQL connection URL
 * @param options - postgres.js options (max connections, etc.)
 */
export function createDatabase(
  connectionString: string,
  options?: postgres.Options<any>
): { db: Database; sql: postgres.Sql } {
  const sql = postgres(connectionString, {
    max: 20,
    idle_timeout: 30,
    ...options,
  });

  const db = drizzle(sql, { schema });

  return { db, sql };
}

/**
 * Execute a callback within a tenant-scoped transaction.
 *
 * Sets `app.current_company_id` via SET LOCAL so RLS policies
 * enforce tenant isolation. The setting is transaction-scoped
 * and never leaks to other connections.
 *
 * @example
 * ```ts
 * const result = await withTenantTransaction(db, companyId, async (tx) => {
 *   return tx.select().from(items);
 * });
 * ```
 */
export async function withTenantTransaction<T>(
  db: Database,
  companyId: string,
  callback: (tx: Database) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    // Set the tenant context for this transaction
    await tx.execute(
      /* sql */ `SELECT set_config('app.current_company_id', '${companyId}', true)`
    );
    return callback(tx as unknown as Database);
  });
}

/**
 * Execute a callback with admin bypass (skips RLS).
 * Use only for migrations, seeding, and background jobs
 * that operate across tenants.
 */
export async function withAdminTransaction<T>(
  db: Database,
  callback: (tx: Database) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      /* sql */ `SELECT set_config('app.is_admin', 'true', true)`
    );
    return callback(tx as unknown as Database);
  });
}

export { schema };
