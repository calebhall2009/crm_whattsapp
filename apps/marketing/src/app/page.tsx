// ─────────────────────────────────────────────────────────────
// Landing Page — POS-inspired marketing site
// Sections: Hero, How It Works, Pricing, Verticals, FAQ, CTA
// ─────────────────────────────────────────────────────────────

const APP_URL = "http://localhost:3000"; // Replace with app.[DOMINIO].com in production

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ══════════════════════════════════════════════════════
          HEADER / NAV
          ══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-2xl">◆</span>
            <span className="font-display font-bold text-xl text-charcoal-800">
              POS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
              Cómo funciona
            </a>
            <a href="#precios" className="text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
              Precios
            </a>
            <a href="#rubros" className="text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
              Rubros
            </a>
            <a href="#faq" className="text-sm text-charcoal-500 hover:text-charcoal-800 transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={`${APP_URL}/sign-in`}
              className="text-sm font-medium text-charcoal-600 hover:text-charcoal-800 transition-colors"
            >
              Iniciar sesión
            </a>
            <a
              href={`${APP_URL}/sign-up`}
              className="px-5 py-2.5 bg-amber-400 text-charcoal-900 rounded-button text-sm font-semibold hover:bg-amber-300 transition-colors shadow-card"
            >
              Empezar gratis
            </a>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-charcoal-800 text-white">
        {/* Receipt texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.5) 28px, rgba(255,255,255,0.5) 29px)",
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 mb-6">
            <span className="text-amber-400 font-mono text-xs tabular-nums">3 DÍAS GRATIS</span>
            <span className="text-amber-400/60 text-xs">•</span>
            <span className="text-amber-400/80 text-xs">Sin tarjeta de crédito</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            El punto de venta que se adapta a{" "}
            <span className="text-amber-400">tu negocio</span>
          </h1>

          <p className="font-body text-lg text-charcoal-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Un solo sistema para retail, restaurantes y servicios. Multi-sucursal,
            con facturación electrónica SRI y reportes en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${APP_URL}/sign-up`}
              className="px-8 py-4 bg-amber-400 text-charcoal-900 rounded-button text-base font-bold hover:bg-amber-300 transition-all shadow-terminal hover:shadow-[0_12px_40px_rgba(232,168,56,0.25)]"
            >
              Empezar prueba gratuita →
            </a>
            <a
              href="#como-funciona"
              className="px-8 py-4 border border-charcoal-600 text-charcoal-300 rounded-button text-base font-medium hover:border-charcoal-400 hover:text-white transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>

          {/* Receipt-style stat bar */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-charcoal-400">
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-white tabular-nums">1</p>
              <p className="text-xs uppercase tracking-wider mt-1">País</p>
            </div>
            <div className="h-8 w-px bg-charcoal-600" />
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-white tabular-nums">3</p>
              <p className="text-xs uppercase tracking-wider mt-1">Rubros</p>
            </div>
            <div className="h-8 w-px bg-charcoal-600" />
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-white tabular-nums">∞</p>
              <p className="text-xs uppercase tracking-wider mt-1">Sucursales</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-24 bg-paper-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-3">
              CÓMO FUNCIONA
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800">
              Vendé en 3 pasos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Registrate",
                desc: "Creá tu cuenta en 2 minutos. Sin tarjeta. Configurá tu empresa, sucursales y equipo.",
                icon: "◎",
              },
              {
                step: "02",
                title: "Cargá tus productos",
                desc: "Agregá productos, ítems de menú o servicios. Definí precios, impuestos y stock.",
                icon: "▤",
              },
              {
                step: "03",
                title: "Empezá a vender",
                desc: "Usá el POS desde cualquier dispositivo. Cobrá en efectivo o tarjeta. Facturá automáticamente.",
                icon: "⊞",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-card shadow-card border border-charcoal-100 p-8 relative group hover:shadow-card-hover transition-shadow"
              >
                <span className="font-mono text-xs text-amber-400 absolute top-4 right-4 tabular-nums">
                  {item.step}
                </span>
                <span className="text-4xl mb-5 block">{item.icon}</span>
                <h3 className="font-display text-xl font-semibold text-charcoal-800 mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-charcoal-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════ */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-3">
              PRECIOS
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              Un plan para cada etapa
            </h2>
            <p className="text-charcoal-500 max-w-xl mx-auto">
              Empezá gratis por 3 días. Sin tarjeta de crédito. Cancelá cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Basic */}
            <PricingCard
              name="Básico"
              price="29"
              period="/mes"
              features={[
                "1 sucursal",
                "2 usuarios",
                "Productos y servicios",
                "Reportes básicos",
                "Soporte por email",
              ]}
              cta="Empezar prueba gratis"
              ctaUrl={`${APP_URL}/sign-up`}
            />

            {/* Pro — highlighted */}
            <PricingCard
              name="Pro"
              price="79"
              period="/mes"
              popular
              features={[
                "Hasta 5 sucursales",
                "10 usuarios",
                "Todos los rubros",
                "Facturación electrónica",
                "Reportes avanzados",
                "Soporte prioritario",
              ]}
              cta="Empezar prueba gratis"
              ctaUrl={`${APP_URL}/sign-up`}
            />

            {/* Enterprise */}
            <PricingCard
              name="Empresa"
              price="149"
              period="/mes"
              features={[
                "Sucursales ilimitadas",
                "Usuarios ilimitados",
                "API acceso completo",
                "Facturación multi-país",
                "Manager dedicado",
                "SLA 99.9%",
              ]}
              cta="Contactar ventas"
              ctaUrl="#"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VERTICALS
          ══════════════════════════════════════════════════════ */}
      <section id="rubros" className="py-24 bg-paper-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-3">
              MULTI-RUBRO
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800">
              Un sistema, tres mundos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <VerticalCard
              icon="🏪"
              title="Retail"
              features={["Control de inventario y SKU", "Código de barras", "Alertas de stock bajo", "Múltiples variantes"]}
            />
            <VerticalCard
              icon="🍔"
              title="Restaurantes y Bares"
              features={["Modificadores de menú", "Gestión de mesas", "Comandas de cocina", "Propinas y split de cuenta"]}
            />
            <VerticalCard
              icon="✂️"
              title="Servicios"
              features={["Agenda de reservas", "Duración por servicio", "Asignación de staff", "Recordatorios automáticos"]}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-500 font-mono text-sm uppercase tracking-widest mb-3">
              FAQ
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            <FaqItem q="¿Necesito tarjeta de crédito para la prueba gratis?" a="No. La prueba de 3 días no requiere tarjeta. Al terminar, elegís un plan o tu cuenta se pausa automáticamente." />
            <FaqItem q="¿Funciona en Ecuador?" a="Sí. El sistema está diseñado y optimizado para Ecuador, con facturación electrónica integrada al SRI." />
            <FaqItem q="¿Puedo tener más de una sucursal?" a="Sí. Desde el plan Pro podés gestionar hasta 5 sucursales, y con el plan Empresa no hay límite." />
            <FaqItem q="¿Qué tipo de reportes tiene?" a="El owner puede ver por empleado: ventas totales, ticket promedio, descuentos aplicados, anulaciones y horas de sesión. Todo en tiempo real." />
            <FaqItem q="¿Emite factura electrónica?" a="Sí. El sistema soporta facturación electrónica para Ecuador a través del SRI, emitiendo facturas, notas de crédito y comprobantes de retención." />
            <FaqItem q="¿Mis datos están seguros?" a="Sí. Cada empresa tiene sus datos completamente aislados a nivel de base de datos. Usamos encriptación en tránsito y en reposo, y nunca almacenamos contraseñas directamente." />
            <FaqItem q="¿Puedo usar mi propio dominio?" a="El sistema funciona desde app.[tudominio].com. Configuraciones de dominio personalizado están disponibles en el plan Empresa." />
            <FaqItem q="¿Qué pasa si se cae la conexión?" a="Las ventas se registran normalmente. La facturación electrónica es asíncrona — si el proveedor fiscal no responde, se reintenta automáticamente." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-charcoal-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Listo para modernizar tu negocio?
          </h2>
          <p className="text-charcoal-300 text-lg mb-8 max-w-xl mx-auto">
            Empezá tu prueba gratuita de 3 días. Sin tarjeta. Sin compromiso.
          </p>
          <a
            href={`${APP_URL}/sign-up`}
            className="inline-block px-10 py-4 bg-amber-400 text-charcoal-900 rounded-button text-lg font-bold hover:bg-amber-300 transition-all shadow-terminal"
          >
            Empezar ahora →
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="bg-charcoal-900 text-charcoal-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">◆</span>
            <span className="font-display font-bold text-white">POS</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} POS SaaS. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Component: Pricing Card ────────────────────────────────

function PricingCard({
  name, price, period, features, cta, ctaUrl, popular = false,
}: {
  name: string; price: string; period: string; features: string[];
  cta: string; ctaUrl: string; popular?: boolean;
}) {
  return (
    <div
      className={`rounded-card p-8 flex flex-col relative ${
        popular
          ? "bg-charcoal-800 text-white shadow-terminal border-2 border-amber-400 scale-105"
          : "bg-white shadow-card border border-charcoal-100"
      }`}
    >
      {popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-charcoal-900 text-xs font-bold rounded-full uppercase tracking-wider">
          Popular
        </span>
      )}
      <h3 className="font-display text-lg font-semibold mb-4">{name}</h3>
      <div className="mb-6">
        <span className="font-mono text-4xl font-bold tabular-nums">${price}</span>
        <span className={`text-sm ${popular ? "text-charcoal-300" : "text-charcoal-400"}`}>
          {period}
        </span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-center gap-2 text-sm ${popular ? "text-charcoal-200" : "text-charcoal-600"}`}>
            <span className="text-amber-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href={ctaUrl}
        className={`block text-center py-3 rounded-button font-semibold text-sm transition-colors ${
          popular
            ? "bg-amber-400 text-charcoal-900 hover:bg-amber-300"
            : "bg-charcoal-800 text-white hover:bg-charcoal-700"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}

// ── Component: Vertical Card ───────────────────────────────

function VerticalCard({ icon, title, features }: { icon: string; title: string; features: string[] }) {
  return (
    <div className="bg-white rounded-card shadow-card border border-charcoal-100 p-8 hover:shadow-card-hover transition-shadow">
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="font-display text-xl font-semibold text-charcoal-800 mb-4">{title}</h3>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-charcoal-600">
            <span className="text-sage-400">•</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Component: FAQ Item ────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-paper-50 rounded-card border border-charcoal-100 overflow-hidden">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-display font-medium text-charcoal-800 hover:bg-paper-100 transition-colors list-none">
        {q}
        <span className="text-charcoal-400 group-open:rotate-45 transition-transform text-xl">+</span>
      </summary>
      <div className="px-6 pb-4 text-sm text-charcoal-600 font-body leading-relaxed">
        {a}
      </div>
    </details>
  );
}
