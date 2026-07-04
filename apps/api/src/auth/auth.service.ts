// ─────────────────────────────────────────────────────────────
// Auth Service — Registro, Login, y JWT propios
//
// Lógica simple estilo Laravel:
//   - register() → hashea contraseña, crea usuario+empresa en un paso
//   - login()    → verifica email+password, devuelve JWT
//   - me()       → retorna el usuario actual desde el JWT
// ─────────────────────────────────────────────────────────────

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import type { Database } from "@pos/database";
import { users, companies } from "@pos/database";
import { DATABASE_TOKEN } from "../database/database.module";

@Injectable()
export class AuthService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  // ── Registro: crea empresa + usuario dueño en un solo paso ──
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    country?: string;
  }) {
    // 1. Verificar que el email no exista ya
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase().trim()))
      .limit(1);

    if (existing) {
      throw new BadRequestException("Este email ya está registrado. Inicia sesión.");
    }

    // 2. Hashear contraseña (10 rondas de salt — balance seguridad/velocidad)
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3. Crear empresa y usuario dentro de una transacción
    return await this.db.transaction(async (tx) => {
      const country = (data.country as any) || "EC";
      const currency = country === "CO" ? "COP" : country === "PE" ? "PEN" : country === "CL" ? "CLP" : "USD";
      const slugBase = data.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const slug = `${slugBase}-${Date.now().toString(36)}`;

      // Crear empresa
      const [company] = await tx
        .insert(companies)
        .values({
          name: data.companyName,
          slug,
          country,
          currency,
          subscriptionStatus: "trialing",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días de prueba
        } as any)
        .returning();

      // Crear usuario dueño
      const [user] = await tx
        .insert(users)
        .values({
          companyId: company.id,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: "owner",
          isActive: true,
          isSuperAdmin: false,
        } as any)
        .returning();

      return { user, company };
    });
  }

  // ── Login: verifica credenciales y genera JWT ──────────────
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // 1. Buscar usuario por email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user || !user.isActive) {
      // No revelamos si el email existe o no (seguridad)
      throw new UnauthorizedException("Email o contraseña incorrectos.");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("Esta cuenta no tiene contraseña configurada. Contacta al soporte.");
    }

    // 2. Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException("Email o contraseña incorrectos.");
    }

    // 3. Actualizar último login
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() } as any)
      .where(eq(users.id, user.id));

    // 4. Generar JWT con datos del usuario
    const secret = process.env.JWT_SECRET || "default_crm_super_secret_key_123";
    const token = jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId,
        role: user.role,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
      secret,
      { expiresIn: "30d" } // Sesión de 30 días
    );

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  // ── Crear super admin (solo para el desarrollador) ─────────
  async createSuperAdmin(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    secretKey: string;
  }) {
    // Verificar clave secreta del desarrollador
    if (data.secretKey !== process.env.SUPER_ADMIN_SECRET) {
      throw new UnauthorizedException("Clave secreta incorrecta.");
    }

    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing) {
      throw new BadRequestException("Este email ya existe.");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({
        companyId: null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        passwordHash,
        role: "owner",
        isActive: true,
        isSuperAdmin: true,
      } as any)
      .returning();

    return user;
  }
}
