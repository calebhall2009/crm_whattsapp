// ─────────────────────────────────────────────────────────────
// Pipeline Kanban — Etapas de ventas
// ─────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const stages = [
    { id: "new",       label: "Nuevos",     color: "border-charcoal-300", count: 0, deals: [] },
    { id: "contacted", label: "Contactados", color: "border-amber-400",    count: 0, deals: [] },
    { id: "qualified", label: "Calificados", color: "border-blue-400",     count: 0, deals: [] },
    { id: "proposal",  label: "Propuesta",   color: "border-purple-400",   count: 0, deals: [] },
    { id: "won",       label: "Ganados ✓",   color: "border-sage-400",     count: 0, deals: [] },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Pipeline de Ventas</h1>
          <p className="text-sm text-charcoal-400 mt-1">Seguimiento visual de tus oportunidades</p>
        </div>
        <button className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-semibold hover:bg-amber-300 transition-colors text-sm">
          + Nueva Oportunidad
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div className={`bg-white rounded-card border-t-4 ${stage.color} shadow-card border border-charcoal-100 p-4 mb-3`}>
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-charcoal-800 text-sm">{stage.label}</h3>
                <span className="text-xs font-mono bg-charcoal-100 text-charcoal-500 px-2 py-0.5 rounded-tag">
                  {stage.count}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3 min-h-[200px]">
              {stage.deals.length === 0 && (
                <div className="border-2 border-dashed border-charcoal-100 rounded-card p-6 text-center text-charcoal-300 text-xs">
                  Sin oportunidades
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-charcoal-400 font-mono mt-4 text-center">
        💡 Las oportunidades se crean automáticamente cuando la IA califica un lead por WhatsApp
      </p>
    </div>
  );
}
