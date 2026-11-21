import React from 'react';
import { Flame, Printer, Navigation, QrCode } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { PageHero, Section, SectionHeader, FeatureCard, LinkCard, CtaBand } from './components/MarketingUI';
import { MARKETING_SEO } from './seo-pages';

export default function ParaRestaurantesPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 font-sans antialiased">
      <SEO {...MARKETING_SEO.restaurantes} />

      <MarketingNavbar />

      <main>
        <PageHero
          eyebrow="Gastronomía & comida · Diseñado para el ritmo de la cocina"
          title="Software para restaurantes y"
          highlight="negocios gastronómicos"
          description="El sistema todo en uno para restaurantes, cafeterías, comidas rápidas y negocios gastronómicos. Menú digital interactivo en mesa o redes, comandas organizadas para cocina y ruta GPS para repartidores con 0% de comisiones."
          ctaTo="/registro"
          ctaLabel="Digitalizar mi restaurante gratis"
          note="Prueba 7 días gratis · Sin comisiones por plato vendido"
        />

        {/* Funcionalidades */}
        <Section>
          <SectionHeader eyebrow="Herramientas hechas para comida" title="Funcionalidades pensadas para la vida real de un restaurante" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FeatureCard icon={Flame} tone="amber" title="Modificadores y adicionales flexibles">
              Permite a tus comensales elegir tipo de salsa, término de carne, sabor de helado (sin costo adicional) o añadir tocineta y queso extra con cobro automático sumado a la comanda.
            </FeatureCard>
            <FeatureCard icon={Printer} tone="sky" title="Impresión térmica para cocina (Bluetooth)">
              Imprime los pedidos directamente desde el teléfono o tablet a una impresora de comandas de 58mm u 80mm vía Bluetooth, sin cables ni servidores complejos.
            </FeatureCard>
            <FeatureCard icon={Navigation} tone="emerald" title="Ruta GPS para el domiciliario">
              El cliente coloca el pin exacto de su casa en el mapa. En el WhatsApp del repartidor aparece el enlace directo que abre Google Maps o Waze en 1 toque.
            </FeatureCard>
            <FeatureCard icon={QrCode} tone="violet" title="Menú QR en mesas y recogida en local">
              Ahorra costos de cartas de papel en mesa y permite a los clientes hacer pedidos para pasar a recoger empacados sin esperar filas en el mostrador.
            </FeatureCard>
          </div>
        </Section>

        {/* Rentabilidad */}
        <Section muted>
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Protege tu margen de ganancia</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Deja de regalar hasta el 30% de tus ventas en comisiones
              </h2>
              <p className="leading-relaxed text-slate-600">
                Las aplicaciones de delivery tradicionales cobran entre el 20% y el 30% más IVA por cada plato que vendes. Con NEGU pagas una tarifa plana accesible y el 100% del dinero de tus clientes va directo a tu cuenta bancaria o Nequi.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Apps tradicionales de comida</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-rose-800">25% a 30% de comisión</p>
                <p className="mt-2 text-sm text-slate-600">Retención de pagos por semanas y clientes que nunca son tuyos.</p>
              </div>

              <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/60 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Con NEGU</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-emerald-700">0% de comisiones</p>
                <p className="mt-2 text-sm font-medium text-slate-700">Cobras al instante directo a tu Nequi o Daviplata. La base de clientes es 100% tuya.</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Enlaces internos */}
        <Section className="py-12 sm:py-14">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">Más soluciones recomendadas</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkCard to="/menu-digital" title="Menú digital con código QR" description="Cartas interactivas para celulares con actualización en tiempo real" />
            <LinkCard to="/para-negocios" title="Software para pequeños negocios" description="Solución para comercios locales, tiendas y emprendimientos" />
          </div>
        </Section>
      </main>

      <CtaBand
        title="Lleva tu restaurante al siguiente nivel con NEGU"
        description="Comienza hoy mismo tu prueba gratuita de 7 días."
        ctaTo="/registro"
        ctaLabel="Probar para mi restaurante gratis"
      />

      <MarketingFooter />
    </div>
  );
}
