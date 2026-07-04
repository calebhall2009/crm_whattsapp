// ─────────────────────────────────────────────────────────────
// Auth Decorators
// ─────────────────────────────────────────────────────────────

import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import type { AuthContext } from "./jwt.guard";

// ── @Public() — skip auth on this endpoint ────────────────────
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// ── @Roles('owner', 'admin') — restrict to specific roles ────
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ── @Auth() — extract auth context from request ──────────────
export const Auth = createParamDecorator(
  (data: keyof AuthContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const auth: AuthContext = request.auth;

    if (data) return auth?.[data];
    return auth;
  }
);

// ── @CompanyId() — shorthand for the current tenant ID ───────
export const CompanyId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.auth?.companyId;
  }
);
