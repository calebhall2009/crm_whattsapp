"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/auth";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadContacts = async (signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${API_URL}/contacts?${params}`, {
        credentials: "include",
        signal,
      });
      if (res.ok && !signal?.aborted) {
        const json = await res.json();
        setContacts(json.data ?? []);
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      console.error(e);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    loadContacts(abortController.signal);
    return () => abortController.abort();
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
          id="search-contacts"
          type="search"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        />
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48 px-3 py-2.5 bg-white border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <option value="">Todos los Estados</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="proposal">Propuesta</option>
          <option value="closed_won">Ganado ✓</option>
          <option value="closed_lost">Perdido</option>
        </select>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-charcoal-400 text-sm p-12">Cargando contactos...</p>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">👥</span>
            <p className="font-display font-semibold text-charcoal-500 text-lg mt-3">No hay contactos encontrados</p>
            <p className="text-sm text-charcoal-400 mt-1">Crea un contacto nuevo o conecta tu WhatsApp bot.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper-50 border-b border-charcoal-100 font-mono text-xs text-charcoal-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Teléfono</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Origen</th>
                <th className="px-5 py-3 font-semibold">Último Contacto</th>
                <th className="px-5 py-3 text-right">Acciones</th>
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
        />
      )}
    </div>
  );
}

function NewContactModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "manual" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const PHONE_RE = /^[+()\d\s-]{7,20}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    if (!name || !phone) {
      setError("Nombre y teléfono son obligatorios.");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      setError("El teléfono solo puede contener dígitos, espacios, +, ( ) y guiones.");
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      setError("El email no tiene un formato válido.");
      return;
    }
    setLoading(true);
    setError("");
    const abortController = new AbortController();
    try {
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          source: form.source,
        }),
        signal: abortController.signal,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al crear el contacto.");
      }
      onSaved();
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    } finally {
      abortController.abort();
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
