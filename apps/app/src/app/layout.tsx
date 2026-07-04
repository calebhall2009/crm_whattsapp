import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthGate } from "../components/AuthGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS SaaS — Punto de Venta",
  description: "Sistema de punto de venta multi-rubro para tu negocio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="min-h-screen bg-paper-50 antialiased">
          <AuthGate>{children}</AuthGate>
        </body>
      </html>
    </ClerkProvider>
  );
}
