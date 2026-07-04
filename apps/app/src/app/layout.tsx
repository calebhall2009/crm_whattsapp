import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM + WhatsApp IA — Tu Sistema de Gestión",
  description: "CRM con WhatsApp automatizado e IA para restaurantes, spas, barberías, hoteles y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper-50 antialiased">
        {children}
      </body>
    </html>
  );
}
