// ─────────────────────────────────────────────────────────────
// JWT Auth Guard — Reemplaza a Clerk
//
// Verifica nuestro propio JWT (firmado con JWT_SECRET).
// Token viene de:
//   1. Cookie httpOnly "crm_token"
//   2. Header: Authorization: Bearer <token>
//
// Adjunta al request: req.auth = { userId, companyId, role, email }
// Rutas marcadas con @Public() se saltan este guard.
// ─────────────────────────────────────────────────────────────

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { IS_PUBLIC_KEY } from "./decorators";

export interface AuthContext {
  userId: string;
  companyId: string | null;
  role: string;
  email: string;
  isSuperAdmin: boolean;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Si la ruta tiene @Public(), dejamos pasar sin verificar
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Extraer token desde cookie o header Authorization
    const token =
      request.cookies?.crm_token ||
      request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new UnauthorizedException("No hay token de sesión. Inicia sesión.");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException("JWT_SECRET no configurado en el servidor.");
    }

    try {
      // Verificar y decodificar el JWT
      const payload = jwt.verify(token, secret) as {
        sub: string;
        companyId: string | null;
        role: string;
        email: string;
        isSuperAdmin: boolean;
      };

      // Adjuntar contexto de auth al request (igual que antes con Clerk)
      const auth: AuthContext = {
        userId: payload.sub,
        companyId: payload.companyId,
        role: payload.role,
        email: payload.email,
        isSuperAdmin: payload.isSuperAdmin ?? false,
      };

      request.auth = auth;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Token inválido o expirado. Vuelve a iniciar sesión.");
    }
  }
}
