// ─────────────────────────────────────────────────────────────
// Database Module — provides Drizzle DB instance via DI
// ─────────────────────────────────────────────────────────────

import { Module, Global } from "@nestjs/common";
import { createDatabase } from "@pos/database";

export const DATABASE_TOKEN = "DATABASE";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL is required");
        const { db } = createDatabase(url);
        return db;
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
