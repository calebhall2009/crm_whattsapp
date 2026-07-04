export default function ReportsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal-800 mb-6">
        Reporte de Actividad por Empleado
      </h1>

      {/* Date filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="date"
          className="px-3 py-2 bg-white border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <input
          type="date"
          className="px-3 py-2 bg-white border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <button className="px-4 py-2 bg-charcoal-800 text-white rounded-button text-sm font-medium hover:bg-charcoal-700 transition-colors">
          Filtrar
        </button>
      </div>

      {/* Employee activity table */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-100 bg-paper-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Ventas
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Ingresos
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Ticket Prom.
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Descuentos
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Anulaciones
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Horas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50">
            {[
              { name: "María López", role: "Cajera", sales: 24, revenue: 486.50, avgTicket: 20.27, discounts: 3, voids: 1, hours: 7.5 },
              { name: "Juan García", role: "Cajero", sales: 18, revenue: 392.00, avgTicket: 21.78, discounts: 1, voids: 0, hours: 8.0 },
              { name: "Ana Torres", role: "Manager", sales: 12, revenue: 315.75, avgTicket: 26.31, discounts: 5, voids: 2, hours: 9.0 },
            ].map((emp, i) => (
              <tr key={i} className="hover:bg-paper-50 transition-colors">
                <td className="px-5 py-4 font-medium text-charcoal-800">{emp.name}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 text-xs rounded-tag font-medium bg-charcoal-50 text-charcoal-600">
                    {emp.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums">{emp.sales}</td>
                <td className="px-5 py-4 text-right font-mono tabular-nums font-semibold text-charcoal-800">
                  ${emp.revenue.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums text-charcoal-500">
                  ${emp.avgTicket.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums">
                  <span className={emp.discounts > 2 ? "text-amber-600 font-medium" : "text-charcoal-500"}>
                    {emp.discounts}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums">
                  <span className={emp.voids > 0 ? "text-rose-500 font-medium" : "text-charcoal-500"}>
                    {emp.voids}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums text-charcoal-500">
                  {emp.hours.toFixed(1)}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-charcoal-400 font-body">
        Este reporte muestra métricas operativas del negocio por empleado. No incluye actividad personal ni mensajes.
      </p>
    </div>
  );
}
