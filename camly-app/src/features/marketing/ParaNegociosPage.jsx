import React from 'react';
import { Share2, CheckCircle2, Shirt, Cake, Coffee, Gift, Wine, PawPrint } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { PageHero, Section, SectionHeader, FeatureCard, LinkCard, CtaBand } from './components/MarketingUI';
import { MARKETING_SEO } from './seo-pages';

const SOCIAL_CHECKS = [
  'Tu catálogo vende mientras atiendes en el local o descansas.',
  'Calcula subtotales exactos evitando errores de cobro.',
  'Sin descargar aplicaciones pesadas ni registros molestos para el cliente.',
];

export default function ParaNegociosPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 font-sans antialiased">
      <SEO {...MARKETING_SEO.negocios} />

      <MarketingNavbar />

      <main>
        <PageHero
          eyebrow="Comercio & retail · Para todo tipo de emprendimientos y tiendas"
          title="Software para pequeños negocios y"
          highlight="comercios locales"
          description="NEGU no es solo para restaurantes. Si vendes productos físicos, repostería, ropa, accesorios, licores o regalos, crea tu catálogo digital profesional y recibe pedidos organizados directo a tu WhatsApp."
          ctaTo="/registro"
          ctaLabel="Crear catálogo para mi negocio gratis"
          note="Prueba 7 días gratis · Sin contratos ni conocimientos técnicos"
        />

        {/* Tipos de negocio */}
        <Section>
          <SectionHeader eyebrow="Versatilidad total" title="Diseñado para el comercio moderno de cualquier categoría" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Shirt} tone="cyan" title="Tiendas de ropa y calzado">
              Muestra tus colecciones con fotos nítidas, tallas, colores disponibles y recibe el pedido exacto por WhatsApp.
            </FeatureCard>
            <FeatureCard icon={Cake} tone="amber" title="Reposterías y pastelerías">
              Permite a tus clientes elegir sabores de tortas, rellenos, tamaños y notas de dedicatoria personalizadas.
            </FeatureCard>
            <FeatureCard icon={Coffee} tone="emerald" title="Cafés, panaderías y minimarkets">
              Facilita pedidos express para pasar a recoger de camino al trabajo o despachos a domicilio cercanos con GPS.
            </FeatureCard>
            <FeatureCard icon={Gift} tone="violet" title="Regalos y anchetas sorpresa">
              Agrupa anchetas por ocasión (cumpleaños, aniversarios) con adiciones de chocolates o globos.
            </FeatureCard>
            <FeatureCard icon={Wine} tone="rose" title="Licoreras y estancos">
              Atención rápida a deshoras. Tus clientes eligen sus botellas y hielo y te llega la dirección en 1 segundo.
            </FeatureCard>
            <FeatureCard icon={PawPrint} tone="indigo" title="Veterinarias y pet shops">
              Venta de concentrados, snacks y accesorios para mascotas con despacho rápido a domicilio.
            </FeatureCard>
          </div>
        </Section>

        {/* Redes sociales */}
        <Section muted>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Ventas en automático</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Convierte a tus seguidores de Instagram y TikTok en compradores reales
              </h2>
              <p className="leading-relaxed text-slate-600">
                Coloca tu enlace oficial de NEGU (ej: <code className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[0.85em] text-slate-800">negu.pro/mitienda</code>) en tu biografía de redes sociales. Cuando alguien se interese en tus publicaciones, abre tu tienda interactiva y te envía el pedido directo a WhatsApp.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-slate-700">
                {SOCIAL_CHECKS.map(t => (
                  <li key={t} className="flex items-center gap-2.5">
                    <CheckCircle2 size={17} className="shrink-0 text-sky-700" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-7">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Share2 size={22} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Enlace oficial para tu perfil</p>
                  <p className="text-xs text-slate-500">Compatible con Instagram, TikTok, WhatsApp Business y Facebook</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-xs text-slate-700">
                <span className="truncate font-semibold text-sky-700">https://negu.pro/tu-marca</span>
                <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">Activo</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Cada vez que un cliente toca tu enlace, entra a tu catálogo moderno con los colores y logo de tu negocio.
              </p>
            </div>
          </div>
        </Section>

        {/* Enlaces internos */}
        <Section className="py-12 sm:py-14">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">Otras soluciones de la plataforma</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkCard to="/pedidos-whatsapp" title="Pedidos por WhatsApp" description="Comandas calculadas y ubicación GPS para domiciliarios" />
            <LinkCard to="/gestion-de-pedidos" title="Gestión y control de pedidos" description="Panel administrativo con reportes en Excel y seguimiento" />
          </div>
        </Section>
      </main>

      <CtaBand
        title="Moderniza la forma de vender en tu negocio con NEGU"
        description="Empieza tus 7 días de prueba gratis y sube tus productos en menos de 5 minutos."
        ctaTo="/registro"
        ctaLabel="Crear mi tienda gratis"
      />

      <MarketingFooter />
    </div>
  );
}
