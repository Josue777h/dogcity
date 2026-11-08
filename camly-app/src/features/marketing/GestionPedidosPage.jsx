import React from 'react';
import { ClipboardList, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { PageHero, Section, SectionHeader, FeatureCard, LinkCard, CtaBand } from './components/MarketingUI';
import { MARKETING_SEO } from './seo-pages';

const TRACK_STEPS = ['Recibido', 'En cocina', 'En camino', 'Entregado'];

export default function GestionPedidosPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 font-sans antialiased">
      <SEO {...MARKETING_SEO.gestionPedidos} />

      <MarketingNavbar />

      <main>
        <PageHero
          eyebrow="Panel de control · Cero comandas perdidas en horas pico"
          title="Gestión y control de pedidos en"
          highlight="tiempo real para negocios"
          description="Administra el ciclo completo de tus ventas: desde que entra la comanda hasta que el domiciliario entrega en la puerta. Visualiza estados, imprime tickets térmicos y exporta tus ingresos sin complicaciones."
          ctaTo="/registro"
          ctaLabel="Probar panel administrativo gratis"
          note="Prueba 7 días gratis · Funciona desde celular, tablet o computador"
        />

        {/* Características */}
        <Section>
          <SectionHeader eyebrow="Operación ágil" title="Todo lo que necesitas para operar tu negocio como un profesional" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard icon={ClipboardList} tone="sky" title="Estados de pedido en vivo">
              Pasa pedidos de <em>Pendiente</em> a <em>En preparación</em>, <em>En camino</em> o <em>Completado</em> con un solo toque. Tu equipo de cocina sabe exactamente qué preparar primero.
            </FeatureCard>
            <FeatureCard icon={Printer} tone="cyan" title="Impresión térmica Bluetooth y comanda">
              Conecta tu impresora térmica portátil Bluetooth (58mm o 80mm) para imprimir comandas instantáneas para cocina o facturas de entrega para el cliente.
            </FeatureCard>
            <FeatureCard icon={FileSpreadsheet} tone="emerald" title="Reportes de ventas en Excel (CSV)">
              Descarga el historial de pedidos con desglose de métodos de pago, totales diarios y productos más vendidos en un archivo compatible con Excel en 1 clic.
            </FeatureCard>
          </div>
        </Section>

        {/* Seguimiento para el cliente */}
        <Section muted>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Experiencia del cliente</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Rastreo de pedido en vivo: reduce la ansiedad de tus compradores
              </h2>
              <p className="leading-relaxed text-slate-600">
                Cada comanda incluye un enlace de seguimiento seguro. El cliente puede consultar en tiempo real si su pedido ya está en el horno, empacado o en manos del repartidor.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-slate-700">
                {[
                  'Evita llamadas insistentes preguntando "¿Ya salió mi pedido?".',
                  'Visualización clara del método de entrega y resumen de artículos.',
                  'Totalmente adaptado a pantallas móviles.',
                ].map(t => (
                  <li key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 size={17} className="shrink-0 text-sky-700" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-900">Estado: En preparación</span>
                </div>
                <span className="text-xs text-slate-500">Pedido #1082</span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Avance del pedido" aria-valuemin={0} aria-valuemax={100} aria-valuenow={66}>
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-600 to-cyan-400" />
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  {TRACK_STEPS.map((s, i) => (
                    <span key={s} className={i === 1 ? 'font-bold text-sky-700' : ''}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Enlaces internos */}
        <Section className="py-12 sm:py-14">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">Otras áreas de la plataforma</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkCard to="/para-restaurantes" title="Software para restaurantes" description="Comandas de cocina, cálculo de rutas y catálogo interactivo" />
            <LinkCard to="/para-negocios" title="Software para pequeños negocios" description="Tiendas, cafeterías, reposterías y comercios locales" />
          </div>
        </Section>
      </main>

      <CtaBand
        title="Toma el control de tus ventas y pedidos hoy"
        description="Empieza tus 7 días de prueba gratis y organiza tu negocio como siempre quisiste."
        ctaTo="/registro"
        ctaLabel="Crear mi cuenta gratis"
      />

      <MarketingFooter />
    </div>
  );
}
