"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

interface Conversation {
  id: string;
  contactId: string;
  status: "open" | "bot" | "agent" | "resolved" | "waiting";
  lastMessageAt?: string;
  contact?: { name: string; phone: string };
}

interface Message {
  id: string;
  role: "user" | "assistant" | "agent" | "system";
  body: string;
  sentAt: string;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  bot:      { label: "🤖 IA",       color: "bg-purple-100 text-purple-700" },
  agent:    { label: "👤 Agente",   color: "bg-amber-100 text-amber-700" },
  open:     { label: "Abierto",     color: "bg-sage-100 text-sage-700" },
  resolved: { label: "Resuelto",    color: "bg-charcoal-100 text-charcoal-500" },
  waiting:  { label: "⏳ Esperando", color: "bg-blue-100 text-blue-700" },
};

const ROLE_STYLE: Record<string, string> = {
  user:      "bg-charcoal-100 text-charcoal-800 self-start",
  assistant: "bg-amber-50 border border-amber-200 text-charcoal-800 self-start",
  agent:     "bg-charcoal-800 text-white self-end",
  system:    "bg-transparent text-charcoal-400 text-xs italic self-center",
};

export default function ConversationsPage() {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Load conversations list
  useEffect(() => {
    async function loadConversations() {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data ?? []);
      }
    }
    loadConversations();
  }, [getToken]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selected) return;
    async function loadMessages() {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/conversations/${selected!.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMessages((json.data ?? []).reverse());
      }
    }
    loadMessages();
  }, [selected, getToken]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleTakeOver() {
    if (!selected) return;
    const token = await getToken();
    await fetch(`${apiUrl}/conversations/${selected.id}/assign`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setSelected({ ...selected, status: "agent" });
  }

  async function handleSend() {
    if (!newMessage.trim() || !selected) return;
    setSending(true);
    const token = await getToken();
    const res = await fetch(`${apiUrl}/conversations/${selected.id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage }),
    });
    if (res.ok) {
      const json = await res.json();
      setMessages((prev) => [...prev, json.data]);
      setNewMessage("");
    }
    setSending(false);
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* ── Conversation list ──────────────────────────────── */}
      <div className="w-72 bg-white rounded-card shadow-card border border-charcoal-100 flex flex-col shrink-0 overflow-hidden">
        <div className="px-4 py-4 border-b border-charcoal-100">
          <h2 className="font-display font-semibold text-charcoal-800">Conversaciones</h2>
          <p className="text-xs text-charcoal-400 mt-0.5">WhatsApp · En tiempo real</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-charcoal-50">
          {conversations.length === 0 ? (
            <p className="text-center text-charcoal-400 text-sm p-6">Sin conversaciones aún</p>
          ) : (
            conversations.map((conv) => {
              const badge = STATUS_BADGE[conv.status] ?? { label: conv.status, color: "" };
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left px-4 py-3 hover:bg-paper-50 transition-colors ${
                    selected?.id === conv.id ? "bg-amber-50 border-l-2 border-amber-400" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-charcoal-800 truncate">
                        {conv.contact?.name ?? conv.contactId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-charcoal-400 font-mono truncate">
                        {conv.contact?.phone}
                      </p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-tag font-medium shrink-0 ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  {conv.lastMessageAt && (
                    <p className="text-xs text-charcoal-400 mt-1">
                      {new Date(conv.lastMessageAt).toLocaleTimeString("es-EC", {
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Message thread ─────────────────────────────────── */}
      {selected ? (
        <div className="flex-1 bg-white rounded-card shadow-card border border-charcoal-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-charcoal-800">
                {selected.contact?.name ?? "Contacto"}
              </h3>
              <p className="text-xs text-charcoal-400 font-mono">{selected.contact?.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              {selected.status === "bot" && (
                <button
                  onClick={handleTakeOver}
                  className="px-3 py-1.5 bg-charcoal-800 text-white text-xs rounded-button font-medium hover:bg-charcoal-700 transition-colors"
                >
                  👤 Tomar control
                </button>
              )}
              <span className={`text-xs px-2 py-1 rounded-tag font-medium ${STATUS_BADGE[selected.status]?.color}`}>
                {STATUS_BADGE[selected.status]?.label}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`max-w-[75%] rounded-card px-4 py-2.5 text-sm leading-relaxed ${ROLE_STYLE[msg.role]}`}>
                {msg.role === "assistant" && (
                  <p className="text-xs text-amber-500 font-mono mb-1">🤖 IA</p>
                )}
                {msg.role === "agent" && (
                  <p className="text-xs text-charcoal-300 font-mono mb-1">👤 Agente</p>
                )}
                <p>{msg.body}</p>
                <p className="text-xs opacity-50 mt-1 font-mono">
                  {new Date(msg.sentAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply box */}
          {selected.status === "agent" && (
            <div className="px-5 py-4 border-t border-charcoal-100 flex gap-3">
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 px-4 py-2.5 bg-paper-50 border border-charcoal-200 rounded-button text-sm font-body placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="px-5 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          )}
          {selected.status === "bot" && (
            <div className="px-5 py-3 border-t border-charcoal-100 text-center text-xs text-charcoal-400 font-body">
              🤖 La IA está manejando esta conversación · <button onClick={handleTakeOver} className="text-amber-600 hover:underline">Tomar control</button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-card shadow-card border border-charcoal-100 flex items-center justify-center text-charcoal-300">
          <div className="text-center">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-display text-lg font-semibold text-charcoal-500">Seleccioná una conversación</p>
            <p className="text-sm mt-1">Los mensajes de WhatsApp aparecen aquí en tiempo real</p>
          </div>
        </div>
      )}
    </div>
  );
}
