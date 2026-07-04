// ─────────────────────────────────────────────────────────────
// Next.js Middleware — Auth propio (sin Clerk)
//
// Rutas protegidas: redirige a /login si no hay token JWT.
// Rutas públicas: /login, /register — siempre accesibles.
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que NO requieren login
const PUBLIC_ROUTES = ["/login", "/register", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y archivos estáticos
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Verificar si hay token JWT en la cookie
  const token = request.cookies.get("crm_token")?.value;

  if (!token) {
    // Sin token: redirigir al login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Con token: continuar normalmente
  // La verificación completa la hace el backend en cada API call
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto archivos estáticos
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
