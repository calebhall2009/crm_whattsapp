"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // Redirigir al dashboard tras un login exitoso
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-paper-50 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl text-amber-500 font-display">◆</span>
        <h2 className="mt-4 text-center text-3xl font-bold font-display text-charcoal-900 tracking-tight">
          Ingresar al Sistema
        </h2>
        <p className="mt-2 text-center text-sm text-charcoal-500">
          CRM & Chatbot de WhatsApp con IA
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ejemplo@negocio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-charcoal-200 rounded-button shadow-sm placeholder-charcoal-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-button shadow-sm text-sm font-semibold text-charcoal-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-all font-mono uppercase"
              >
                {loading ? "Iniciando Sesión..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-charcoal-500">
              ¿No tienes una cuenta aún?{" "}
              <Link href="/register" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
