"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, API_URL } from "@/lib/auth";

interface SettingSection {
  id: string;
  label: string;
  icon: string;
}

const SECTIONS: SettingSection[] = [
  { id: "company",      label: "Empresa",          icon: "🏢" },
  { id: "whatsapp",     label: "WhatsApp / Bot IA", icon: "💬" },
  { id: "support",      label: "Soporte Técnico",  icon: "🎫" },
  { id: "notifications",label: "Notificaciones",   icon: "🔔" },
  { id: "billing",      label: "Plan & Facturación",icon: "💳" },
  { id: "team",         label: "Equipo",            icon: "👥" },
];

export default function SettingsPage() {
  const [active, setActive] = useState("company");
  const [user, setUser] = useState<any>(null);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    taxId: "",
    phone: "",
    address: "",
    website: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados de Tickets de Soporte
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Obtener datos iniciales de la empresa
      if (currentUser?.companyId) {
        try {
          const res = await fetch(`${API_URL}/companies/me`, {
            credentials: "include"
          });
          if (res.ok) {
            const data = await res.json();
            setCompanyForm({
              name: data.name || "",
              taxId: data.taxId || "",
              phone: data.phone || "",
              address: data.address || "",
              website: data.website || "",
            });
          }
        } catch (e) {
          console.error("Error al cargar datos de empresa:", e);
        }
      }
    }
    loadUser();
  }, []);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${API_URL}/companies/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: companyForm.name, taxId: companyForm.taxId }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setTicketSending(true);
    try {
      // Endpoint mock o real para guardar ticket de soporte
      const res = await fetch(`${API_URL}/admin/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          priority: ticketPriority,
        }),
      });

      if (res.ok) {
        setTicketSent(true);
        setTicketSubject("");
        setTicketMessage("");
        setTimeout(() => setTicketSent(false), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketSending(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal-800">Configuración</h1>
        <p className="text-sm text-charcoal-400 mt-1">Gestiona tu empresa, integraciones y preferencias</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar nav ── */}
        <nav className="lg:w-56 shrink-0">
          <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                id={`settings-tab-${s.id}`}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-l-2 ${
                  active === s.id
                    ? "border-amber-400 bg-amber-50 text-charcoal-900"
                    : "border-transparent text-charcoal-500 hover:bg-paper-50 hover:text-charcoal-800"
                }`}
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {active === "company" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">Datos de la Empresa</h2>
              <p className="text-sm text-charcoal-400 mb-6">Información básica de tu negocio</p>

              {saved && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-button text-sm flex items-center gap-2">
                  <span>✅</span> Cambios guardados correctamente.
                </div>
              )}

              <form onSubmit={handleSaveCompany} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="setting-name" className="block text-xs font-medium text-charcoal-600 mb-1">
                      Nombre de la Empresa *
                    </label>
                    <input
                      id="setting-name"
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="Mi Negocio S.A."
                      className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="setting-taxid" className="block text-xs font-medium text-charcoal-600 mb-1">
                      RUC / NIT
                    </label>
                    <input
                      id="setting-taxid"
                      type="text"
                      value={companyForm.taxId}
                      onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                      placeholder="0912345678001"
                      className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="setting-phone" className="block text-xs font-medium text-charcoal-600 mb-1">
                      Teléfono
                    </label>
                    <input
                      id="setting-phone"
                      type="tel"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      placeholder="+593 99 000 0000"
                      className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="setting-website" className="block text-xs font-medium text-charcoal-600 mb-1">
                      Sitio Web
                    </label>
                    <input
                      id="setting-website"
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      placeholder="https://mi-negocio.com"
                      className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="setting-address" className="block text-xs font-medium text-charcoal-600 mb-1">
                    Dirección
                  </label>
                  <input
                    id="setting-address"
                    type="text"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    placeholder="Av. Principal 123, Guayaquil, Ecuador"
                    className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-save-company"
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {active === "whatsapp" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">WhatsApp & Bot IA</h2>
              <p className="text-sm text-charcoal-400 mb-6">Configura la integración de WhatsApp y el comportamiento del agente</p>

              <div className="space-y-5">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-card">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <p className="font-semibold text-charcoal-800 text-sm">Bot Local Activo</p>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        Tu bot de WhatsApp se ejecuta localmente en tu computador y se comunica con esta API en la nube.
                        Para mantenerlo activo 24/7, deberás dejarlo corriendo en tu máquina o en un servidor propio.
                      </p>
                    </div>
                  </div>
                </div>

                <SettingRow
                  label="API URL del Backend"
                  value={API_URL}
                  description="URL donde el bot local envía los mensajes para ser procesados por la IA."
                  mono
                />
                <SettingRow
                  label="Modelo de IA"
                  value="Gemini 2.5 Flash"
                  description="Modelo de lenguaje usado para generar respuestas automáticas."
                />
                <SettingRow
                  label="Período de Prueba"
                  value="14 días activos"
                  description="Tu cuenta está en período de prueba gratuito."
                />
              </div>

              <div className="mt-6 pt-5 border-t border-charcoal-100">
                <h3 className="text-sm font-semibold text-charcoal-700 mb-3">Variables de Entorno del Bot</h3>
                <div className="bg-charcoal-900 rounded-card p-4 font-mono text-xs text-emerald-400 space-y-1">
                  <p><span className="text-charcoal-400"># En tu archivo .env del bot local</span></p>
                  <p>CRM_API_URL={API_URL}</p>
                  <p>GEMINI_API_KEY=<span className="text-amber-400">tu_clave_aqui</span></p>
                </div>
              </div>
            </div>
          )}

          {active === "support" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">Soporte Técnico</h2>
              <p className="text-sm text-charcoal-400 mb-6">Envía tus consultas o reporta problemas directamente a nuestro equipo de desarrollo</p>

              {ticketSent && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-button text-sm flex items-center gap-2">
                  <span>✅</span> Ticket enviado. Nos pondremos en contacto contigo lo antes posible.
                </div>
              )}

              <form onSubmit={handleSendTicket} className="space-y-4">
                <div>
                  <label htmlFor="ticket-subject" className="block text-xs font-medium text-charcoal-600 mb-1">
                    Asunto *
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ej. Integración de WhatsApp no responde, Error en el dashboard"
                    className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  />
                </div>
                <div>
                  <label htmlFor="ticket-priority" className="block text-xs font-medium text-charcoal-600 mb-1">
                    Prioridad
                  </label>
                  <select
                    id="ticket-priority"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <option value="low">Baja - Duda o sugerencia</option>
                    <option value="medium">Media - Error menor</option>
                    <option value="high">Alta - Error de funcionalidad</option>
                    <option value="urgent">Urgente - Sistema caído o bloqueado</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="ticket-message" className="block text-xs font-medium text-charcoal-600 mb-1">
                    Mensaje / Detalles *
                  </label>
                  <textarea
                    id="ticket-message"
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Explica detalladamente qué sucede y cómo podemos ayudarte..."
                    className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-send-ticket"
                    type="submit"
                    disabled={ticketSending}
                    className="px-6 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    {ticketSending ? "Enviando..." : "Enviar Ticket"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {active === "notifications" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">Notificaciones</h2>
              <p className="text-sm text-charcoal-400 mb-6">Controla cuándo y cómo recibes alertas</p>

              <div className="space-y-4">
                {[
                  { id: "notif-new-contact", label: "Nuevo contacto desde WhatsApp", desc: "Recibe una alerta cuando un nuevo cliente escribe por primera vez." },
                  { id: "notif-escalation",  label: "Escalamiento a agente humano", desc: "Notificación cuando la IA escala una conversación a un agente." },
                  { id: "notif-appointment", label: "Recordatorio de citas",         desc: "Alerta 30 minutos antes de cada cita programada." },
                  { id: "notif-pipeline",    label: "Cambios en el pipeline",        desc: "Alertas cuando un contacto avanza de etapa." },
                ].map((n) => (
                  <div key={n.id} className="flex items-start justify-between gap-4 py-3 border-b border-charcoal-5 default:border-0 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-charcoal-800">{n.label}</p>
                      <p className="text-xs text-charcoal-400 mt-0.5">{n.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input id={n.id} type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-charcoal-200 peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer peer-checked:bg-amber-400 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "billing" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">Plan & Facturación</h2>
              <p className="text-sm text-charcoal-400 mb-6">Tu plan actual y opciones de suscripción</p>

              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-card mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Plan Actual</p>
                    <p className="text-2xl font-bold font-display text-charcoal-800 mt-1">Prueba Gratuita</p>
                    <p className="text-sm text-charcoal-500 mt-1">14 días de acceso completo</p>
                  </div>
                  <span className="text-4xl">🚀</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "Básico",      price: "$29/mes", features: ["500 msgs/mes", "1 usuario", "CRM básico"] },
                  { name: "Pro",         price: "$79/mes", features: ["Ilimitado",    "5 usuarios", "IA + Pipeline"], highlight: true },
                  { name: "Enterprise",  price: "$199/mes",features: ["Ilimitado",    "Usuarios ilimitados", "API personalizada"] },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-5 rounded-card border ${
                      plan.highlight
                        ? "border-amber-400 bg-amber-50 shadow-card-hover"
                        : "border-charcoal-200"
                    }`}
                  >
                    {plan.highlight && (
                      <span className="text-xs font-bold bg-amber-400 text-charcoal-900 px-2 py-0.5 rounded-tag mb-2 inline-block">
                        POPULAR
                      </span>
                    )}
                    <p className="font-display font-bold text-charcoal-800 text-lg">{plan.name}</p>
                    <p className="text-2xl font-bold text-charcoal-900 mt-1">{plan.price}</p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-charcoal-500 flex items-center gap-1.5">
                          <span className="text-emerald-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      id={`btn-plan-${plan.name.toLowerCase()}`}
                      className={`w-full mt-4 py-2 rounded-button text-sm font-semibold transition-colors ${
                        plan.highlight
                          ? "bg-amber-400 text-charcoal-900 hover:bg-amber-300"
                          : "border border-charcoal-200 text-charcoal-600 hover:bg-paper-50"
                      }`}
                    >
                      Seleccionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "team" && (
            <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-6">
              <h2 className="font-display font-semibold text-charcoal-800 text-lg mb-1">Equipo</h2>
              <p className="text-sm text-charcoal-400 mb-6">Gestiona los miembros y sus roles</p>

              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-charcoal-500">1 miembro activo</p>
                <button
                  id="btn-invite-member"
                  className="px-4 py-2 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors"
                >
                  + Invitar Miembro
                </button>
              </div>

              <div className="border border-charcoal-100 rounded-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-paper-50 border-b border-charcoal-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-charcoal-900 font-bold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal-800">Tú ({user?.role || "Propietario"})</p>
                      <p className="text-xs text-charcoal-400 font-mono">cuenta activa</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-tag font-medium capitalize">
                    {user?.role || "Owner"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-charcoal-400 mt-4">
                Con tu plan actual puedes tener hasta <strong>1 usuario</strong>. Actualiza a Pro para añadir hasta 5 miembros al equipo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  value,
  description,
  mono = false,
}: {
  label: string;
  value: string;
  description: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-charcoal-50">
      <div>
        <p className="text-sm font-medium text-charcoal-800">{label}</p>
        <p className="text-xs text-charcoal-400 mt-0.5">{description}</p>
      </div>
      <span className={`text-sm text-charcoal-600 shrink-0 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
