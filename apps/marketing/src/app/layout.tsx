import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS SaaS — El punto de venta que tu negocio necesita",
  description:
    "Sistema de punto de venta multi-rubro para retail, restaurantes y servicios. Prueba gratis por 3 días.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
