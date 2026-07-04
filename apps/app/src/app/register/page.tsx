"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("EC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !companyName) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        companyName,
        country,
      });
      // Tras el registro y login automático exitoso, ir al onboarding para detalles adicionales
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al intentar crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-paper-50 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl text-amber-500 font-display">◆</span>
        <h2 className="mt-4 text-center text-3xl font-bold font-display text-charcoal-900 tracking-tight">
          Crea tu Cuenta Gratis
        </h2>
        <p className="mt-2 text-center text-sm text-charcoal-500">
          Activa tu CRM con WhatsApp IA en menos de 1 minuto
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
                <label htmlFor="firstName" className="block text-sm font-medium text-charcoal-700">
                  Nombre *
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Ej. Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-charcoal-700">
                  Apellido *
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Ej. Pérez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-charcoal-700">
                Nombre de la Empresa / Negocio *
              </label>
              <div className="mt-1">
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="Ej. Spa Vitalidad, Barbería Estilo"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700">
                Correo Electrónico *
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700">
                Contraseña *
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Crea una contraseña segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-charcoal-700">
                País
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-charcoal-200 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-button font-mono"
              >
                <option value="EC">Ecuador</option>
                <option value="CO">Colombia</option>
                <option value="PE">Perú</option>
                <option value="CL">Chile</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-button shadow-sm text-sm font-semibold text-charcoal-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono uppercase"
              >
                {loading ? "Creando Cuenta..." : "Registrarme"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-charcoal-500">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
