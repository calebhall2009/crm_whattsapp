// ─────────────────────────────────────────────────────────────
// Roles Guard — enforces role-based access per endpoint
// ─────────────────────────────────────────────────────────────

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY, IS_PUBLIC_KEY } from "./decorators";
import type { AuthContext } from "./clerk.guard";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No @Roles() decorator = any authenticated user can access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const auth: AuthContext = request.auth;

    if (!auth) {
      throw new ForbiddenException("No authentication context");
    }

    if (!requiredRoles.includes(auth.role)) {
      throw new ForbiddenException(
        `Requires one of: ${requiredRoles.join(", ")}. You have: ${auth.role}`
      );
    }

    return true;
  }
}
