"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/auth";

interface Ticket {
  ticket: {
    id: string;
    companyId: string;
    userId: string | null;
    subject: string;
    message: string;
    adminReply: string | null;
    adminRepliedAt: string | null;
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
    updatedAt: string;
  };
  company: {
    id: string;
    name: string;
  } | null;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/tickets`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("No autorizado.");
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/admin/tickets/${selectedTicket.ticket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reply: replyText.trim(),
          status: "resolved", // Marcar resuelto al responder
        }),
      });

      if (res.ok) {
        setSelectedTicket(null);
        setReplyText("");
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center font-mono">
        <p className="animate-pulse">Cargando Tickets de Soporte...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-body">
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">🎫 Tickets de Soporte</h1>
        <p className="text-sm text-charcoal-400 mt-1">Monitorea y atiende las solicitudes de ayuda de tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white p-8 rounded-card border border-charcoal-100 text-center text-charcoal-400">
              ✅ Todos los tickets están al día. ¡Buen trabajo!
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.ticket.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-5 rounded-card border transition-all cursor-pointer bg-white ${
                  selectedTicket?.ticket.id === t.ticket.id
                    ? "border-amber-500 shadow-card-hover"
                    : "border-charcoal-100 hover:border-charcoal-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-tag text-xs font-semibold uppercase ${
                    t.ticket.priority === "urgent" || t.ticket.priority === "high"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-charcoal-100 text-charcoal-700"
                  }`}>
                    {t.ticket.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-tag text-xs font-semibold uppercase ${
                    t.ticket.status === "open"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {t.ticket.status}
                  </span>
                </div>

                <h3 className="font-bold text-charcoal-900 mt-2 text-base">{t.ticket.subject}</h3>
                <p className="text-sm text-charcoal-500 line-clamp-2 mt-1">{t.ticket.message}</p>

                <div className="flex items-center justify-between text-xs text-charcoal-400 mt-4 border-t border-charcoal-50 pt-3 font-mono">
                  <span>🏢 {t.company?.name || "Sin Empresa"}</span>
                  <span>📅 {new Date(t.ticket.createdAt).toLocaleDateString("es-EC")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Ticket details / Response form */}
        <div className="bg-white p-6 rounded-card border border-charcoal-100 shadow-card self-start">
          {selectedTicket ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-charcoal-400 font-mono">Cliente / Empresa</span>
                <p className="font-bold text-charcoal-900">{selectedTicket.company?.name}</p>
              </div>

              <div>
                <span className="text-xs text-charcoal-400 font-mono">Asunto</span>
                <p className="font-bold text-charcoal-900 text-base">{selectedTicket.ticket.subject}</p>
              </div>

              <div>
                <span className="text-xs text-charcoal-400 font-mono">Mensaje de ayuda</span>
                <p className="text-sm text-charcoal-700 bg-paper-50 p-3 rounded-button border border-charcoal-100 whitespace-pre-wrap mt-1">
                  {selectedTicket.ticket.message}
                </p>
              </div>

              {selectedTicket.ticket.adminReply && (
                <div>
                  <span className="text-xs text-charcoal-400 font-mono">Tu última respuesta</span>
                  <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-button border border-emerald-100 whitespace-pre-wrap mt-1">
                    {selectedTicket.ticket.adminReply}
                  </p>
                </div>
              )}

              {/* Response Form */}
              <form onSubmit={handleReplySubmit} className="space-y-3 pt-4 border-t border-charcoal-100">
                <label htmlFor="admin-reply" className="block text-xs font-semibold text-charcoal-700">
                  Escribir Respuesta Oficial
                </label>
                <textarea
                  id="admin-reply"
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe la solución o respuesta para el cliente..."
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="w-full py-2 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  {sending ? "Enviando respuesta..." : "Enviar y Cerrar Ticket"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12 text-charcoal-300">
              <span className="text-5xl">🎫</span>
              <p className="font-display font-semibold text-charcoal-500 mt-3">Selecciona un Ticket</p>
              <p className="text-xs mt-1">Haz clic en cualquier ticket de la lista para ver detalles y responder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
