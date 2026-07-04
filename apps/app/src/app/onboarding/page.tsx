"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout, getCurrentUser, API_URL } from "@/lib/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [userRole, setUserRole] = useState("owner");
  const [vertical, setVertical] = useState("retail");
  const [domain, setDomain] = useState("");
  const [employees, setEmployees] = useState("1-5");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar si el usuario está logueado
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
      } else {
        setUserName((user.email || "").split("@")[0] || "Usuario");
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const employeesNum =
        employees === "1-5" ? 3 : employees === "6-15" ? 10 : employees === "16-50" ? 30 : 100;

      // Actualizar perfil de la empresa con los datos adicionales
      const res = await fetch(`${API_URL}/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Enviar cookie crm_token automáticamente
        body: JSON.stringify({
          vertical,
          employees: employeesNum,
          domain: domain.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al completar el registro inicial.");
      }

      // Redirigir al dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-paper-50 font-body">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-sm font-semibold text-charcoal-700 capitalize">Hola, {userName}</span>
        <button
          onClick={logout}
          className="text-xs text-rose-600 hover:text-rose-700 border border-rose-200 px-2 py-1 rounded hover:bg-rose-50 transition-all font-mono"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl text-amber-500 font-display">◆</span>
        <h2 className="mt-4 text-center text-3xl font-bold font-display text-charcoal-900 tracking-tight">
          Configuración de tu Negocio
        </h2>
        <p className="mt-2 text-center text-sm text-charcoal-500">
          Completa estos datos para activar tu CRM & Sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-card rounded-card border border-charcoal-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-button">
                <div className="flex">
                  <div className="flex-shrink-0 text-rose-500 font-bold">✕</div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-rose-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="userRole" className="block text-sm font-medium text-charcoal-700">
                  Tu Rol *
                </label>
                <select
                  id="userRole"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-charcoal-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-button font-mono"
                >
                  <option value="owner">Dueño / Fundador</option>
                  <option value="admin">Administrador</option>
                  <option value="manager">Gerente de Local</option>
                  <option value="cashier">Cajero / Personal</option>
                </select>
              </div>

              <div>
                <label htmlFor="vertical" className="block text-sm font-medium text-charcoal-700">
                  Rubro Principal *
                </label>
                <select
                  id="vertical"
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-charcoal-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-button font-mono"
                >
                  <option value="services">Servicios, Spa o Barbería</option>
                  <option value="restaurant">Restaurante o Bar</option>
                  <option value="hotel">Hotel o Alojamiento</option>
                  <option value="retail">Retail / Comercio</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-charcoal-700">
                Dominio Corporativo (Opcional)
              </label>
              <div className="mt-1">
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  placeholder="Ej. mi-negocio.pos.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
              <p className="mt-1.5 text-xs text-charcoal-400 font-mono">
                Si lo dejas vacío, te asignaremos uno automáticamente.
              </p>
            </div>

            <div>
              <label htmlFor="employees" className="block text-sm font-medium text-charcoal-700">
                N° de Empleados *
              </label>
              <select
                id="employees"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-charcoal-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-button font-mono"
              >
                <option value="1-5">1 a 5 empleados</option>
                <option value="6-15">6 a 15 empleados</option>
                <option value="16-50">16 a 50 empleados</option>
                <option value="50+">Más de 50 empleados</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-button shadow-sm text-sm font-semibold text-charcoal-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono uppercase"
              >
                {loading ? "Configurando Sistema..." : "Comenzar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
