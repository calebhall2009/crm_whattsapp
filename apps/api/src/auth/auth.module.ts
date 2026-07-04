// ─────────────────────────────────────────────────────────────
// Auth Module — JWT propio (sin Clerk)
// ─────────────────────────────────────────────────────────────

import { Module, Global } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt.guard";
import { RolesGuard } from "./roles.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    // Guard principal — verifica JWT en cada request
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard secundario — verifica @Roles()
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
