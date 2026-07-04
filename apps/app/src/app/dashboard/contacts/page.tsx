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
  const [showModal, setShowModal] = useState(false);

  async function loadContacts() {
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

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Contactos</h1>
          <p className="text-sm text-charcoal-400 mt-1">Leads y clientes de WhatsApp</p>
        </div>
        <button
          id="btn-nuevo-contacto"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-semibold hover:bg-amber-300 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
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
            <p className="text-sm text-charcoal-400 mb-4">
              Los leads que escriban por WhatsApp aparecerán aquí automáticamente.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              + Crear primer contacto
            </button>
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

      {/* New Contact Modal */}
      {showModal && (
        <NewContactModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setLoading(true);
            loadContacts();
          }}
          getToken={getToken}
        />
      )}
    </div>
  );
}

function NewContactModal({
  onClose,
  onSaved,
  getToken,
}: {
  onClose: () => void;
  onSaved: () => void;
  getToken: () => Promise<string | null>;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "manual" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          source: form.source,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al crear el contacto.");
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-md border border-charcoal-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-charcoal-800">
          <h3 className="font-display font-bold text-white text-lg">👤 Nuevo Contacto</h3>
          <button onClick={onClose} className="text-charcoal-300 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-sm text-rose-700">{error}</div>
          )}
          <div>
            <label htmlFor="contact-name" className="block text-xs font-medium text-charcoal-600 mb-1">Nombre completo *</label>
            <input
              id="contact-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. María González"
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className="block text-xs font-medium text-charcoal-600 mb-1">Teléfono (WhatsApp) *</label>
            <input
              id="contact-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+593 99 123 4567"
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-xs font-medium text-charcoal-600 mb-1">Email (opcional)</label>
            <input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>
          <div>
            <label htmlFor="contact-source" className="block text-xs font-medium text-charcoal-600 mb-1">Origen</label>
            <select
              id="contact-source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <option value="manual">✏️ Manual</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="referral">🤝 Referido</option>
              <option value="web">🌐 Web</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-charcoal-200 rounded-button text-sm font-semibold text-charcoal-600 hover:bg-paper-50 transition-colors">
              Cancelar
            </button>
            <button
              id="btn-guardar-contacto"
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {loading ? "Guardando..." : "Guardar Contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
