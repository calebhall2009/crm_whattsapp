"use client";

import { useState } from "react";

interface Appointment {
  id: string;
  title: string;
  contact: string;
  phone: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

const STATUS_CONFIG = {
  scheduled:  { label: "Programada",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  confirmed:  { label: "Confirmada",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  completed:  { label: "Completada",  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled:  { label: "Cancelada",   color: "bg-rose-100 text-rose-600 border-rose-200" },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 → 19:00

const SAMPLE: Appointment[] = [
  { id: "1", title: "Consulta inicial",  contact: "María González", phone: "+593 99 123 4567", date: today(), time: "09:00", duration: 60,  status: "confirmed", notes: "Primera visita" },
  { id: "2", title: "Seguimiento",       contact: "Carlos Rodríguez", phone: "+593 98 765 4321", date: today(), time: "11:30", duration: 30, status: "scheduled" },
  { id: "3", title: "Cierre de trato",   contact: "Ana Pérez",     phone: "+593 96 555 1234", date: today(), time: "15:00", duration: 45, status: "scheduled", notes: "Enviar propuesta previa" },
];

function today() {
  return new Date().toISOString().split("T")[0] ?? "";
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today());

  const dayAppts = appointments.filter((a) => a.date === selectedDate);

  const todayStats = {
    total:     appointments.filter((a) => a.date === today()).length,
    confirmed: appointments.filter((a) => a.date === today() && a.status === "confirmed").length,
    pending:   appointments.filter((a) => a.date === today() && a.status === "scheduled").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800">Citas & Agenda</h1>
          <p className="text-sm text-charcoal-400 mt-1">Gestiona tus reuniones y citas con clientes</p>
        </div>
        <button
          id="btn-nueva-cita"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button font-semibold hover:bg-amber-300 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Citas Hoy",    value: todayStats.total,     icon: "📅", color: "text-charcoal-800" },
          { label: "Confirmadas",  value: todayStats.confirmed,  icon: "✅", color: "text-blue-700" },
          { label: "Pendientes",   value: todayStats.pending,    icon: "⏳", color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-card shadow-card border border-charcoal-100 p-4 flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
              <p className="text-xs text-charcoal-400 font-body">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Date Picker / Mini Calendar ── */}
        <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-5">
          <h2 className="font-display font-semibold text-charcoal-800 mb-4">Seleccionar Fecha</h2>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          />
          <p className="mt-3 text-xs text-charcoal-500 capitalize">{formatDate(selectedDate)}</p>

          <div className="mt-5 border-t border-charcoal-100 pt-4">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3">Próximas citas</p>
            {appointments
              .filter((a) => a.date >= today() && a.status !== "cancelled")
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .slice(0, 4)
              .map((a) => (
                <div key={a.id} className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-charcoal-400 w-10 shrink-0">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal-700 truncate">{a.contact}</p>
                    <p className="text-xs text-charcoal-400 truncate">{a.title}</p>
                  </div>
                </div>
              ))}
            {appointments.filter((a) => a.date >= today() && a.status !== "cancelled").length === 0 && (
              <p className="text-xs text-charcoal-400">No hay citas próximas</p>
            )}
          </div>
        </div>

        {/* ── Day Schedule ── */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-charcoal-800 capitalize">
              {formatDate(selectedDate)}
            </h2>
            <span className="text-xs px-2 py-1 bg-charcoal-100 text-charcoal-500 rounded-tag font-mono">
              {dayAppts.length} cita{dayAppts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {dayAppts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-display font-semibold text-charcoal-700 mb-1">Sin citas para este día</p>
              <p className="text-sm text-charcoal-400 mb-4">Agenda una nueva cita con el botón de arriba.</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors"
              >
                + Nueva Cita
              </button>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-50">
              {dayAppts
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appt) => {
                  const cfg = STATUS_CONFIG[appt.status];
                  return (
                    <div key={appt.id} className="flex items-start gap-4 px-5 py-4 hover:bg-paper-50 transition-colors">
                      <div className="text-center w-14 shrink-0 pt-0.5">
                        <p className="text-base font-bold font-mono text-charcoal-700">{appt.time}</p>
                        <p className="text-xs text-charcoal-400 font-mono">{appt.duration}min</p>
                      </div>
                      <div className="w-0.5 self-stretch bg-amber-300 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-charcoal-800 text-sm">{appt.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-tag border font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal-600 flex items-center gap-1.5">
                          <span>👤</span> {appt.contact}
                        </p>
                        <p className="text-xs text-charcoal-400 font-mono mt-0.5">{appt.phone}</p>
                        {appt.notes && (
                          <p className="text-xs text-charcoal-500 mt-1.5 bg-paper-50 px-2 py-1 rounded italic">
                            📝 {appt.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {appt.status === "scheduled" && (
                          <button
                            onClick={() =>
                              setAppointments((prev) =>
                                prev.map((a) => (a.id === appt.id ? { ...a, status: "confirmed" } : a))
                              )
                            }
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                          >
                            Confirmar
                          </button>
                        )}
                        {(appt.status === "scheduled" || appt.status === "confirmed") && (
                          <button
                            onClick={() =>
                              setAppointments((prev) =>
                                prev.map((a) => (a.id === appt.id ? { ...a, status: "completed" } : a))
                              )
                            }
                            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors font-medium"
                          >
                            Completar
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setAppointments((prev) =>
                              prev.map((a) => (a.id === appt.id ? { ...a, status: "cancelled" } : a))
                            )
                          }
                          className="text-xs px-2 py-1 bg-rose-50 text-rose-500 rounded hover:bg-rose-100 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── New Appointment Modal ── */}
      {showModal && (
        <NewAppointmentModal
          onClose={() => setShowModal(false)}
          onSave={(appt) => {
            setAppointments((prev) => [...prev, { ...appt, id: Date.now().toString() }]);
            setSelectedDate(appt.date);
            setShowModal(false);
          }}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}

function NewAppointmentModal({
  onClose,
  onSave,
  defaultDate,
}: {
  onClose: () => void;
  onSave: (appt: Omit<Appointment, "id">) => void;
  defaultDate: string;
}) {
  const [form, setForm] = useState({
    title: "",
    contact: "",
    phone: "",
    date: defaultDate,
    time: "09:00",
    duration: 60,
    notes: "",
    status: "scheduled" as Appointment["status"],
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.contact.trim() || !form.phone.trim()) {
      setError("Completa los campos obligatorios (título, contacto y teléfono).");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-card shadow-2xl w-full max-w-md border border-charcoal-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100 bg-charcoal-800">
          <h3 className="font-display font-bold text-white text-lg">📅 Nueva Cita</h3>
          <button
            onClick={onClose}
            className="text-charcoal-300 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">Título / Motivo *</label>
            <input
              id="appt-title"
              type="text"
              placeholder="Ej. Consulta inicial, Seguimiento..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1">Contacto *</label>
              <input
                id="appt-contact"
                type="text"
                placeholder="Nombre completo"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1">Teléfono *</label>
              <input
                id="appt-phone"
                type="tel"
                placeholder="+593 99 ..."
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1">Fecha *</label>
              <input
                id="appt-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1">Hora *</label>
              <input
                id="appt-time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal-600 mb-1">Duración</label>
              <select
                id="appt-duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-600 mb-1">Notas (Opcional)</label>
            <textarea
              id="appt-notes"
              rows={2}
              placeholder="Detalles adicionales..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-charcoal-200 rounded-button text-sm font-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-charcoal-200 rounded-button text-sm font-semibold text-charcoal-600 hover:bg-paper-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-guardar-cita"
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
