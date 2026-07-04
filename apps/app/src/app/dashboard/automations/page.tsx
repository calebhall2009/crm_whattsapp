// ─────────────────────────────────────────────────────────────
// Automations Page — Reglas de WhatsApp IA
// ─────────────────────────────────────────────────────────────

const AUTOMATION_TEMPLATES = [
  {
    id: "1",
    name: "Bienvenida a nuevo lead",
    trigger: "Nuevo lead por WhatsApp",
    action: "Enviar mensaje de bienvenida",
    message: "¡Hola! Gracias por escribirnos 👋 Soy el asistente virtual. ¿En qué te puedo ayudar?",
    isActive: true,
    executions: 0,
    icon: "👋",
  },
  {
    id: "2",
    name: "Follow-up 24h sin respuesta",
    trigger: "Sin respuesta en 24 horas",
    action: "Enviar recordatorio",
    message: "Hola! Te escribimos para saber si pudimos ayudarte. ¿Tienes alguna consulta? 😊",
    isActive: true,
    executions: 0,
    icon: "⏰",
  },
  {
    id: "3",
    name: "Follow-up 48h sin respuesta",
    trigger: "Sin respuesta en 48 horas",
    action: "Enviar último intento + escalar a agente",
    message: "Queremos asegurarnos de que tengas toda la información que necesitas. Un agente te contactará pronto.",
    isActive: false,
    executions: 0,
    icon: "📲",
  },
  {
    id: "4",
    name: "Confirmación de cita",
    trigger: "Cita agendada por el bot",
    action: "Enviar confirmación por WhatsApp",
    message: "✅ Tu cita ha sido agendada. Te enviaremos un recordatorio 24h antes.",
    isActive: true,
    executions: 0,
    icon: "📅",
  },
];

export default function AutomationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Automatizaciones</h1>
          <p className="text-sm text-charcoal-400 mt-1">Reglas automáticas para tu WhatsApp con IA</p>
        </div>
        <button className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-semibold hover:bg-amber-300 transition-colors text-sm">
          + Nueva Regla
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-card p-4 mb-6 flex gap-3">
        <span className="text-xl">⚡</span>
        <div>
          <p className="font-semibold text-charcoal-800 text-sm">Cómo funcionan las automatizaciones</p>
          <p className="text-sm text-charcoal-500 mt-0.5">
            Define un trigger (ej: "nuevo lead") y una acción (ej: "enviar mensaje"). 
            El sistema ejecuta la regla automáticamente sin intervención humana.
          </p>
        </div>
      </div>

      {/* Automations list */}
      <div className="space-y-4">
        {AUTOMATION_TEMPLATES.map((auto) => (
          <div
            key={auto.id}
            className="bg-white rounded-card shadow-card border border-charcoal-100 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-2xl">{auto.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-charcoal-800">{auto.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-tag font-medium ${
                        auto.isActive
                          ? "bg-sage-100 text-sage-700"
                          : "bg-charcoal-100 text-charcoal-500"
                      }`}
                    >
                      {auto.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 mb-3">
                    <span>
                      <span className="font-medium text-charcoal-700">Trigger:</span> {auto.trigger}
                    </span>
                    <span>→</span>
                    <span>
                      <span className="font-medium text-charcoal-700">Acción:</span> {auto.action}
                    </span>
                  </div>
                  <div className="bg-charcoal-50 rounded-button px-4 py-2.5 text-sm text-charcoal-600 font-body border border-charcoal-100">
                    <span className="text-xs font-mono text-charcoal-400 block mb-1">Mensaje:</span>
                    {auto.message}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Toggle */}
                <button
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    auto.isActive ? "bg-amber-400" : "bg-charcoal-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      auto.isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
                <span className="text-xs text-charcoal-400 font-mono">{auto.executions} ejecuciones</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
