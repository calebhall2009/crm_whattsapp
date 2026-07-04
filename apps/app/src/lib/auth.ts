// ─────────────────────────────────────────────────────────────
// lib/auth.ts — Helpers de autenticación del lado cliente
//
// Lógica simple: el token JWT vive en una cookie httpOnly
// (la setea el backend en /auth/login y /auth/register).
// En el frontend, usamos la cookie automáticamente en las peticiones.
// ─────────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://posapi-production-4969.up.railway.app";

// Tipo de usuario autenticado
export interface CurrentUser {
  userId: string;
  companyId: string | null;
  role: string;
  email: string;
  isSuperAdmin: boolean;
}

// ── Iniciar sesión ──────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // importante: envía y recibe cookies
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Email o contraseña incorrectos.");
  }

  return res.json();
}

// ── Registrar nuevo usuario ─────────────────────────────────
export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  country?: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la cuenta.");
  }

  return res.json();
}

// ── Cerrar sesión ───────────────────────────────────────────
export async function logout() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  // Redirigir al login
  window.location.href = "/login";
}

// ── Obtener usuario actual ───────────────────────────────────
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── URL de la API ────────────────────────────────────────────
export { API_URL };
