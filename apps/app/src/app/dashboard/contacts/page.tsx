"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "closed_won" | "closed_lost";
  source: string;
  lastContactedAt?: string;
  tags?: string[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:         { label: "Nuevo",       color: "bg-charcoal-100 text-charcoal-600" },
  contacted:   { label: "Contactado",  color: "bg-amber-100 text-amber-700" },
  qualified:   { label: "Calificado",  color: "bg-blue-100 text-blue-700" },
  proposal:    { label: "Propuesta",   color: "bg-purple-100 text-purple-700" },
  closed_won:  { label: "Ganado ✓",    color: "bg-sage-100 text-sage-700" },
  closed_lost: { label: "Perdido",     color: "bg-rose-100 text-rose-600" },
};

const SOURCE_ICONS: Record<string, string> = {
  whatsapp: "💬",
  manual: "✏️",
  import: "📥",
  referral: "🤝",
  web: "🌐",
};

export default function ContactsPage() {
  const { getToken } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`${apiUrl}/contacts?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setContacts(json.data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, statusFilter, getToken]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Contactos</h1>
          <p className="text-sm text-charcoal-400 mt-1">Leads y clientes de WhatsApp</p>
        </div>
        <button className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-semibold hover:bg-amber-300 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          + Nuevo Contacto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-charcoal-200 rounded-button text-sm font-body placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-charcoal-400 font-mono text-sm animate-pulse">
            Cargando contactos...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-display font-semibold text-charcoal-700 mb-1">Sin contactos aún</p>
            <p className="text-sm text-charcoal-400">
              Los leads que escriban por WhatsApp aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-100 bg-paper-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Contacto</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Estado</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Origen</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Último contacto</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {contacts.map((c) => {
                const statusInfo = STATUS_LABELS[c.status] ?? { label: c.status, color: "bg-charcoal-100 text-charcoal-500" };
                return (
                  <tr key={c.id} className="hover:bg-paper-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-800 text-sm">{c.name}</p>
                          {c.email && <p className="text-xs text-charcoal-400">{c.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-charcoal-600">{c.phone}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-tag text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-lg">
                      {SOURCE_ICONS[c.source] ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-charcoal-400 font-mono">
                      {c.lastContactedAt
                        ? new Date(c.lastContactedAt).toLocaleDateString("es-EC")
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/contacts/${c.id}`}
                        className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
