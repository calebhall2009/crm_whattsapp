// ─────────────────────────────────────────────────────────────
// Row-Level Security (RLS) SQL
//
// This file contains the raw SQL statements that enable RLS
// on every tenant-scoped table. These are applied via a custom
// migration after the initial schema migration.
//
// Pattern:
//   1. Enable + Force RLS on the table
//   2. Create a policy that restricts rows to the current
//      tenant (set via SET LOCAL app.current_company_id)
//   3. Create a bypass policy for the migration/admin role
//
// The NestJS tenant middleware sets the session variable
// before every query within a request transaction.
// ─────────────────────────────────────────────────────────────

/**
 * Tables that need RLS (every table with a company_id column).
 * The `companies` table itself does NOT get RLS — it's accessed
 * during tenant resolution before the context is set.
 */
export const RLS_TABLES = [
  "locations",
  "users",
  "items",
  "item_modifiers",
  "item_staff_assignments",
  "orders",
  "order_items",
  "payments",
  "fiscal_documents",
  "audit_log",
] as const;

/**
 * Generates the full RLS setup SQL for all tenant-scoped tables.
 * Run this once after the initial schema migration.
 */
export function generateRlsSetupSql(): string {
  const statements: string[] = [];

  for (const table of RLS_TABLES) {
    statements.push(`
-- ── RLS for "${table}" ──────────────────────────────────────
ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;

-- Tenant isolation policy: only rows matching the current session tenant
DROP POLICY IF EXISTS tenant_isolation ON "${table}";
CREATE POLICY tenant_isolation ON "${table}"
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

-- Admin bypass: for migrations, seeding, and superuser operations
DROP POLICY IF EXISTS admin_bypass ON "${table}";
CREATE POLICY admin_bypass ON "${table}"
  USING (current_setting('app.is_admin', true) = 'true');
`);
  }

  return statements.join("\n");
}

/**
 * SQL to set the tenant context for a database session/transaction.
 * Must be called at the start of every request that accesses tenant data.
 *
 * Uses SET LOCAL so the setting is scoped to the current transaction
 * and doesn't leak across pooled connections.
 */
export function setTenantContextSql(companyId: string): string {
  return `SET LOCAL app.current_company_id = '${companyId}';`;
}

/**
 * SQL to enable admin bypass (for migrations and background jobs).
 */
export function setAdminBypassSql(): string {
  return `SET LOCAL app.is_admin = 'true';`;
}
