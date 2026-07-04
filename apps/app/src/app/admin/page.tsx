"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/auth";

interface SystemSummary {
  companies: number;
  users: number;
  contacts: number;
  conversations: number;
  openTickets: number;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  subscriptionStatus: string;
  trialEndsAt?: string;
  createdAt: string;
  stats: {
    users: number;
    contacts: number;
    conversations: number;
  };
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        // Cargar resumen
        const summaryRes = await fetch(`${API_URL}/admin/summary`, {
          credentials: "include",
        });
        if (!summaryRes.ok) throw new Error("No autorizado.");
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        // Cargar lista de empresas
        const companiesRes = await fetch(`${API_URL}/admin/companies`, {
          credentials: "include",
        });
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de administración.");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center font-mono">
        <p className="animate-pulse">Cargando Panel de Desarrollador...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-card max-w-md text-center">
          <p className="text-2xl mb-2">🛑</p>
          <p className="font-semibold">{error}</p>
          <p className="text-xs text-charcoal-400 mt-2">Esta sección es de acceso exclusivo para super administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-charcoal-900">🛡 Panel de Monitoreo</h1>
        <p className="text-sm text-charcoal-400 mt-1">Control del estado del CRM SaaS, base de clientes y métricas del sistema.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Empresas" value={summary?.companies ?? 0} icon="🏢" />
        <StatCard title="Usuarios" value={summary?.users ?? 0} icon="👤" />
        <StatCard title="Contactos (Leads)" value={summary?.contacts ?? 0} icon="👥" />
        <StatCard title="Conversaciones" value={summary?.conversations ?? 0} icon="💬" />
        <StatCard
          title="Tickets Abiertos"
          value={summary?.openTickets ?? 0}
          icon="🎫"
          alert={!!summary?.openTickets && summary.openTickets > 0}
        />
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-card shadow-card border border-charcoal-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-charcoal-100 bg-charcoal-800 text-white">
          <h2 className="font-display font-semibold text-lg">Empresas Registradas</h2>
          <p className="text-xs text-charcoal-300 mt-0.5">Lista de clientes activos y sus recursos en el sistema</p>
        </div>

        {companies.length === 0 ? (
          <p className="text-center text-charcoal-400 py-12">No hay empresas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-paper-50 border-b border-charcoal-100 font-mono text-xs text-charcoal-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Negocio</th>
                  <th className="px-5 py-3">País</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Métricas</th>
                  <th className="px-5 py-3">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-paper-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-charcoal-800">{company.name}</p>
                      <p className="text-xs text-charcoal-400 font-mono">{company.slug}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-charcoal-600">
                      {company.country} ({company.currency})
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-tag text-xs font-semibold uppercase ${
                        company.subscriptionStatus === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {company.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs space-y-0.5 text-charcoal-500 font-mono">
                      <p>👥 {company.stats.users} usuarios</p>
                      <p>📱 {company.stats.contacts} contactos</p>
                      <p>💬 {company.stats.conversations} mensajes</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-charcoal-400 font-mono">
                      {new Date(company.createdAt).toLocaleDateString("es-EC")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  alert = false,
}: {
  title: string;
  value: number;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div className={`p-5 rounded-card border shadow-card transition-all ${
      alert
        ? "border-rose-400 bg-rose-50/50 shadow-rose-100"
        : "border-charcoal-200 bg-white"
    }`}>
      <div className="flex items-center justify-between text-2xl">
        <span>{icon}</span>
        {alert && <span className="animate-ping w-2.5 h-2.5 rounded-full bg-rose-500" />}
      </div>
      <p className="text-2xl font-bold font-display text-charcoal-900 mt-2">{value}</p>
      <p className="text-xs text-charcoal-500 font-medium mt-1 uppercase tracking-wider">{title}</p>
    </div>
  );
}
