// ─────────────────────────────────────────────────────────────
// Auth Module — Clerk JWT verification + role-based access
// ─────────────────────────────────────────────────────────────

import { Module, Global } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkAuthGuard } from "./clerk.guard";
import { RolesGuard } from "./roles.guard";

export const CLERK_CLIENT = "CLERK_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: CLERK_CLIENT,
      useFactory: async () => {
        const { createClerkClient } = await import("@clerk/backend");
        return createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY!,
        });
      },
    },
    // Apply auth guard globally — all routes require auth by default
    // Use @Public() decorator to opt out specific endpoints
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [CLERK_CLIENT],
})
export class AuthModule {}
