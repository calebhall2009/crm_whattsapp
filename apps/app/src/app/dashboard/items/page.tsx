export default function ItemsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal-800">
          Productos y Servicios
        </h1>
        <button className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-medium hover:bg-amber-300 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          + Nuevo Item
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-charcoal-50 rounded-button p-1 w-fit">
        {["Todos", "Productos", "Menú", "Servicios"].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 rounded-tag text-sm font-medium text-charcoal-600 hover:text-charcoal-800 hover:bg-white transition-all first:bg-white first:shadow-card first:text-charcoal-800"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-100 bg-paper-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-5 py-3 text-center text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50">
            {[
              { name: "Camiseta básica", type: "Producto", price: 12.99, stock: 50, active: true },
              { name: "Pantalón jean", type: "Producto", price: 29.99, stock: 30, active: true },
              { name: "Hamburguesa clásica", type: "Menú", price: 8.50, stock: null, active: true },
              { name: "Cerveza artesanal", type: "Menú", price: 4.00, stock: null, active: true },
              { name: "Corte de cabello", type: "Servicio", price: 15.00, stock: null, active: true },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-paper-50 transition-colors">
                <td className="px-5 py-4 font-medium text-charcoal-800">{item.name}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 text-xs rounded-tag font-medium bg-charcoal-50 text-charcoal-600">
                    {item.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums text-charcoal-800">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right font-mono tabular-nums text-charcoal-500">
                  {item.stock ?? "—"}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="px-2 py-1 text-xs rounded-tag font-medium bg-sage-100 text-sage-700">
                    Activo
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
