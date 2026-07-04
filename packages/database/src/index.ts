// ─────────────────────────────────────────────────────────────
// @pos/database — Public API
// ─────────────────────────────────────────────────────────────

export { createDatabase, withTenantTransaction, withAdminTransaction, schema } from "./client";
export type { Database } from "./client";
export { generateRlsSetupSql, setTenantContextSql, setAdminBypassSql, RLS_TABLES } from "./rls";

// Re-export all schema tables for direct imports
export * from "./schema";
