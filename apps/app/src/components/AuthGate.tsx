"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const checkedPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Evitar verificar múltiples veces para la misma ruta
    if (checkedPathRef.current === pathname) return;

    async function verifyAuth() {
      // Rutas totalmente públicas que no requieren ninguna autenticación
      if (pathname === "/login" || pathname === "/register" || pathname === "/") {
        checkedPathRef.current = pathname;
        setChecking(false);
        setIsLoaded(true);
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!user) {
          // Si no está logueado y no está en una ruta pública, enviar a login
          checkedPathRef.current = pathname;
          router.push("/login");
          return;
        }

        // Si está logueado pero no tiene una empresa asociada (y no está en onboarding),
        // redirigir a completar el perfil / onboarding
        if (!user.companyId && !user.isSuperAdmin && pathname !== "/onboarding") {
          checkedPathRef.current = pathname;
          router.push("/onboarding");
          return;
        }

        // Si ya tiene empresa e intenta ir a onboarding o login, enviarlo al dashboard
        if ((user.companyId || user.isSuperAdmin) && (pathname === "/onboarding" || pathname === "/login")) {
          checkedPathRef.current = pathname;
          router.push("/dashboard");
          return;
        }

        // Permitir el paso
        checkedPathRef.current = pathname;
        setChecking(false);
        setIsLoaded(true);
      } catch (err) {
        console.error("Error al verificar estado de autenticación:", err);
        checkedPathRef.current = pathname;
        router.push("/login");
      }
    }

    verifyAuth();
  }, [pathname, router]);

  // Pantalla de carga estética mientras verificamos el estado
  if (!isLoaded || checking) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-paper-50 font-mono text-charcoal-700"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 mb-4 animate-pulse">
          <span className="text-xl" aria-hidden="true">◆</span>
          <span className="font-bold tracking-tight text-lg uppercase">Cargando Sistema...</span>
        </div>
        <div className="w-48 h-1 bg-charcoal-100 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-amber-400 rounded-full animate-progress" />
        </div>
        <span className="sr-only">Cargando, por favor espere.</span>
      </div>
    );
  }

  return <>{children}</>;
}
