// ─────────────────────────────────────────────────────────────
// Clerk Auth Guard
//
// Verifies the Clerk JWT from:
//   1. The __session httpOnly cookie (same-origin requests)
//   2. The Authorization: Bearer header (cross-origin)
//
// After verification, attaches user context to the request:
//   req.auth = { userId, companyId, role }
//
// Skipped for routes decorated with @Public()
// ─────────────────────────────────────────────────────────────

import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "./decorators";
import { DATABASE_TOKEN } from "../database/database.module";
import type { Database } from "@pos/database";
import { users } from "@pos/database";
import { eq } from "drizzle-orm";

export interface AuthContext {
  clerkUserId: string;
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    @Inject("CLERK_CLIENT") private readonly clerk: any,
    @Inject(DATABASE_TOKEN) private readonly db: Database,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Extract token from cookie or header — NEVER from query params
    const token =
      request.cookies?.__session ||
      request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException("No authentication token provided");
    }

    try {
      // Verify the JWT with Clerk
      const payload = await this.clerk.verifyToken(token);

      // Look up the internal user by clerk_user_id
      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, payload.sub))
        .limit(1);

      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or deactivated");
      }

      // Attach auth context to request
      const auth: AuthContext = {
        clerkUserId: payload.sub,
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
      };

      request.auth = auth;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException("Invalid or expired session token");
    }
  }
}
