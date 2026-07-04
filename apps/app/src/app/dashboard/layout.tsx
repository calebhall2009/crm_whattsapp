import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-paper-50">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 bg-charcoal-800 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-charcoal-700">
          <h1 className="font-display text-xl font-bold tracking-tight text-amber-400">
            ◆ POS
          </h1>
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
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-charcoal-700 flex items-center gap-3">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
          <span className="text-sm text-charcoal-300 truncate">Mi Cuenta</span>
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
