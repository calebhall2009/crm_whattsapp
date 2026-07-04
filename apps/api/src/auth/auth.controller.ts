// ─────────────────────────────────────────────────────────────
// Auth Controller — Endpoints de autenticación
//
// POST /auth/register   → Crear cuenta nueva
// POST /auth/login      → Iniciar sesión (devuelve JWT)
// POST /auth/logout     → Cerrar sesión (borra cookie)
// GET  /auth/me         → Retorna datos del usuario actual
// POST /auth/super-admin → Crear super admin (solo con clave secreta)
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { Public } from "./decorators";
import { Auth } from "./decorators";
import type { AuthContext } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registra un nuevo usuario y su empresa.
   * Devuelve el JWT en una cookie httpOnly y en el body.
   */
  @Post("register")
  @Public()
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      companyName: string;
      country?: string;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(body);

    // Hacer login automático después del registro
    const loginResult = await this.authService.login(body.email, body.password);

    // Guardar JWT en cookie httpOnly (más seguro que localStorage)
    res.cookie("crm_token", loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      path: "/",
    });

    return {
      message: "Cuenta creada exitosamente",
      token: loginResult.token,
      user: loginResult.user,
      company: {
        id: result.company.id,
        name: result.company.name,
      },
    };
  }

  /**
   * POST /auth/login
   * Inicia sesión con email y contraseña.
   */
  @Post("login")
  @Public()
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body.email, body.password);

    // Guardar JWT en cookie httpOnly
    res.cookie("crm_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return {
      message: "Sesión iniciada",
      token: result.token,
      user: result.user,
    };
  }

  /**
   * POST /auth/logout
   * Cierra la sesión borrando la cookie.
   */
  @Post("logout")
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("crm_token", { path: "/" });
    return { message: "Sesión cerrada correctamente" };
  }

  /**
   * GET /auth/me
   * Devuelve los datos del usuario autenticado actualmente.
   */
  @Get("me")
  async me(@Auth() auth: AuthContext) {
    return {
      userId: auth.userId,
      companyId: auth.companyId,
      role: auth.role,
      email: auth.email,
      isSuperAdmin: auth.isSuperAdmin,
    };
  }

  /**
   * POST /auth/super-admin
   * Crea un usuario super admin (solo con SUPER_ADMIN_SECRET en el body).
   * Este endpoint es para el desarrollador únicamente.
   */
  @Post("super-admin")
  @Public()
  async createSuperAdmin(
    @Body()
    body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      secretKey: string;
    }
  ) {
    const user = await this.authService.createSuperAdmin(body);
    return {
      message: "Super admin creado exitosamente",
      userId: user.id,
      email: user.email,
    };
  }
}
