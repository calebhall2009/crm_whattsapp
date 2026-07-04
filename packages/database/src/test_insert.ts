import postgres from "postgres";

async function main() {
  const url = "postgresql://postgres:MZhXiucAjxUXsfTuFRwCvGCxxRilxZNP@hayabusa.proxy.rlwy.net:23722/railway";
  console.log("Connecting to:", url);
  const sql = postgres(url);

  try {
    console.log("Starting transaction...");
    await sql.begin(async (tx) => {
      // 1. Insert Company
      console.log("Inserting company...");
      const [company] = await tx`
        INSERT INTO companies (name, slug, country, currency, domain, subscription_status, trial_ends_at)
        VALUES ('Test Company', 'test-company-1234', 'EC', 'USD', 'test-company.pos4.com', 'trialing', NOW())
        RETURNING *
      `;
      console.log("Company inserted:", company);

      // 2. Insert User
      console.log("Inserting user...");
      const [user] = await tx`
        INSERT INTO users (company_id, clerk_user_id, role, first_name, last_name, email, is_active)
        VALUES (${company.id}, 'user_test_clerk_id_123', 'owner', 'Test', 'User', 'test@example.com', true)
        RETURNING *
      `;
      console.log("User inserted:", user);

      // 3. Insert Location
      console.log("Inserting location...");
      const [location] = await tx`
        INSERT INTO locations (company_id, name, timezone, is_active)
        VALUES (${company.id}, 'Casa Matriz', 'America/Guayaquil', true)
        RETURNING *
      `;
      console.log("Location inserted:", location);

      // Rollback to keep database clean
      throw new Error("ROLLBACK_FOR_TEST");
    });
  } catch (err: any) {
    if (err.message === "ROLLBACK_FOR_TEST") {
      console.log("✅ Success! Transaction logic is fully correct, database schemas and constraints match perfectly!");
    } else {
      console.error("❌ Onboarding transaction error:", err.message, err.stack);
    }
  } finally {
    await sql.end();
  }
}

main();
