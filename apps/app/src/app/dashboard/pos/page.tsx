"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// POS Terminal — Full-screen checkout interface
// ─────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Demo items — will be loaded from API
  const demoItems = [
    { id: "1", name: "Camiseta básica", price: 12.99, type: "product" },
    { id: "2", name: "Pantalón jean", price: 29.99, type: "product" },
    { id: "3", name: "Hamburguesa clásica", price: 8.50, type: "menu_item" },
    { id: "4", name: "Cerveza artesanal", price: 4.00, type: "menu_item" },
    { id: "5", name: "Corte de cabello", price: 15.00, type: "service" },
  ];

  const filteredItems = demoItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item: (typeof demoItems)[0]) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.id === itemId ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci
        )
        .filter((ci) => ci.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  return (
    <div className="flex gap-6 h-[calc(100vh-5rem)]">
      {/* ── Item Grid ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Buscar producto, menú o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-button font-body text-pos-base placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="flex flex-col p-4 bg-white rounded-card border border-charcoal-100 hover:border-amber-400 hover:shadow-card-hover transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]"
            >
              <span className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">
                {item.type === "product"
                  ? "Producto"
                  : item.type === "menu_item"
                    ? "Menú"
                    : "Servicio"}
              </span>
              <span className="font-body font-medium text-charcoal-800 mb-2 line-clamp-2">
                {item.name}
              </span>
              <span className="font-mono text-pos-price text-amber-600 tabular-nums mt-auto">
                ${item.price.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Cart / Receipt ──────────────────────────────────── */}
      <div className="w-80 bg-white rounded-card shadow-terminal border border-charcoal-100 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-charcoal-100">
          <h2 className="font-display text-lg font-semibold text-charcoal-800">
            Venta Actual
          </h2>
          <p className="text-xs text-charcoal-400 font-mono">
            {new Date().toLocaleDateString("es-EC")}
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-charcoal-300">
              <span className="text-4xl mb-2">⊞</span>
              <p className="text-sm font-body">
                Seleccioná productos para agregar
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 pb-3 border-b border-dashed border-charcoal-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-charcoal-800 truncate">
                      {item.name}
                    </p>
                    <p className="font-mono text-xs text-charcoal-400 tabular-nums">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-tag bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 text-sm font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-tag bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 text-sm font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-mono text-sm font-semibold text-charcoal-800 tabular-nums w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-dashed border-charcoal-200 bg-paper-50 rounded-b-card">
            <div className="flex justify-between text-sm text-charcoal-500 mb-1">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-charcoal-500 mb-3">
              <span>IVA (12%)</span>
              <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-charcoal-200 pt-3 flex justify-between items-baseline">
              <span className="font-display font-bold text-charcoal-800">TOTAL</span>
              <span className="font-mono text-pos-total text-charcoal-900 tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Payment buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="py-3 bg-sage-400 text-white rounded-button font-medium hover:bg-sage-500 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                💵 Efectivo
              </button>
              <button className="py-3 bg-charcoal-800 text-white rounded-button font-medium hover:bg-charcoal-700 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                💳 Tarjeta
              </button>
            </div>
            <button
              onClick={() => setCart([])}
              className="w-full mt-2 py-2.5 text-rose-500 bg-rose-50 border border-rose-200 rounded-button text-sm font-medium hover:bg-rose-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              Cancelar Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
