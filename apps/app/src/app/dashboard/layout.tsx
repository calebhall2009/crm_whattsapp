"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout, getCurrentUser, CurrentUser } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    loadUser();
  }, []);

  return (
    <div className="flex h-screen bg-paper-50">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 bg-charcoal-800 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-charcoal-700 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-tight text-amber-400">
            ◆ CRM + IA
          </h1>
          {user?.isSuperAdmin && (
            <span className="bg-amber-400/20 text-amber-300 text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-amber-400/30">
              Admin
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink href="/dashboard" icon="◉">
            Panel
          </NavLink>
          <NavLink href="/dashboard/contacts" icon="👥">
            Contactos
          </NavLink>
          <NavLink href="/dashboard/conversations" icon="💬">
            Conversaciones
          </NavLink>
          <NavLink href="/dashboard/pipeline" icon="⟶">
            Pipeline
          </NavLink>
          <NavLink href="/dashboard/appointments" icon="📅">
            Citas
          </NavLink>

          <div className="border-t border-charcoal-700 my-4" />

          <NavLink href="/dashboard/automations" icon="⚡">
            Automatizaciones
          </NavLink>
          <NavLink href="/dashboard/settings" icon="⚙">
            Configuración
          </NavLink>

          {/* Links del Super Admin */}
          {user?.isSuperAdmin && (
            <>
              <div className="border-t border-charcoal-700 my-4" />
              <div className="px-3 mb-2 text-xs font-mono text-charcoal-400 uppercase tracking-wider">
                Panel Desarrollador
              </div>
              <NavLink href="/admin" icon="🛡">
                Monitoreo Clientes
              </NavLink>
              <NavLink href="/admin/tickets" icon="🎫">
                Tickets Soporte
              </NavLink>
            </>
          )}
        </nav>

        {/* User Profile / Logout */}
        <div className="px-4 py-4 border-t border-charcoal-700 flex flex-col gap-2 bg-charcoal-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-charcoal-900 font-bold flex items-center justify-center text-sm capitalize">
              {user?.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-charcoal-400 truncate">Sesión activa</p>
              <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1.5 rounded hover:bg-rose-500/10 transition-colors flex items-center gap-2"
          >
            <span>✕</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto motion-safe:animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-charcoal-300 hover:text-white hover:bg-charcoal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="text-base" aria-hidden="true">
        {icon}
      </span>
      {children}
    </Link>
  );
}
