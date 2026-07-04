import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-charcoal-800">
          Panel de Control
        </h1>
        <p className="text-sm text-charcoal-400 mt-1">
          CRM · Automatizaciones WhatsApp con IA
        </p>
      </div>

      {/* ── CRM Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Total Contactos"
          value="—"
          icon="👥"
          href="/dashboard/contacts"
        />
        <SummaryCard
          label="Conversaciones Activas"
          value="—"
          icon="💬"
          href="/dashboard/conversations"
          variant="highlight"
        />
        <SummaryCard
          label="Citas Hoy"
          value="—"
          icon="📅"
          href="/dashboard/appointments"
        />
        <SummaryCard
          label="Tasa de Respuesta IA"
          value="—"
          icon="🤖"
          suffix="%"
        />
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/contacts" icon="👥" label="Ver Contactos" />
          <QuickAction href="/dashboard/conversations" icon="💬" label="Ver Chats" />
          <QuickAction href="/dashboard/pipeline" icon="⟶" label="Pipeline" />
          <QuickAction href="/dashboard/automations" icon="⚡" label="Automatizaciones" />
        </div>
      </div>

      {/* ── Bot status ─────────────────────────────────────── */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
        <h2 className="font-display text-lg font-semibold text-charcoal-800 mb-4">
          Estado del Bot de WhatsApp
        </h2>
        <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-card border border-charcoal-100">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="font-medium text-charcoal-700 text-sm">IA conectada · Modo desarrollo</p>
            <p className="text-xs text-charcoal-400 mt-0.5">
              Configura <code className="font-mono bg-charcoal-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> y{" "}
              <code className="font-mono bg-charcoal-100 px-1 rounded">GEMINI_API_KEY</code> en el .env para producción.
            </p>
          </div>
          <span className="ml-auto text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-tag font-medium">
            Dev Mode
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label, value, icon, href, variant = "default", suffix,
}: {
  label: string; value: string; icon: string; href?: string;
  variant?: "default" | "highlight"; suffix?: string;
}) {
  const card = (
    <div className={`rounded-card shadow-card border p-5 transition-all ${
      variant === "highlight"
        ? "bg-charcoal-800 border-charcoal-700 text-white"
        : "bg-white border-charcoal-100 hover:shadow-card-hover"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm font-body ${variant === "highlight" ? "text-charcoal-300" : "text-charcoal-500"}`}>
          {label}
        </p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold font-display ${variant === "highlight" ? "text-white" : "text-charcoal-800"}`}>
        {value}{suffix}
      </p>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-card border border-charcoal-100 hover:border-amber-300 hover:shadow-card-hover transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-charcoal-700">{label}</span>
    </Link>
  );
}

