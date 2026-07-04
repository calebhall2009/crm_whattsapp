import postgres from "postgres";

async function main() {
  const url = "postgresql://postgres:MZhXiucAjxUXsfTuFRwCvGCxxRilxZNP@hayabusa.proxy.rlwy.net:23722/railway";
  const sql = postgres(url);

  try {
    const companiesList = await sql`SELECT * FROM companies`;
    console.log("Companies:", companiesList);

    const usersList = await sql`SELECT * FROM users`;
    console.log("Users:", usersList);
  } catch (err: any) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
