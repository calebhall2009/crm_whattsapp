// ─────────────────────────────────────────────────────────────
// Migration script to apply RLS policies
// Run this after the initial drizzle-kit migration:
//   npx tsx src/apply-rls.ts
// ─────────────────────────────────────────────────────────────

import postgres from "postgres";
import { generateRlsSetupSql } from "./rls";

async function applyRls() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    const rlsSql = generateRlsSetupSql();
    console.log("🔒 Applying RLS policies...\n");
    console.log(rlsSql);
    await sql.unsafe(rlsSql);
    console.log("\n✅ RLS policies applied successfully");
  } catch (error) {
    console.error("❌ Failed to apply RLS:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyRls();
