import React from 'react';
import { MessageCircle, MapPin, Navigation, CheckCircle2, ShieldCheck } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { PageHero, Section, SectionHeader, IconRow, LinkCard, CtaBand } from './components/MarketingUI';
import { MARKETING_SEO } from './seo-pages';

const WITHOUT_NEGU = [
  'El cliente saluda y pregunta "¿Qué sabores tienen?".',
  'Tienes que escribir o enviar una foto pesada con la carta.',
  'El cliente escribe su pedido por partes olvidando la salsa o bebida.',
  'Tienes que sumar los precios manualmente con calculadora.',
  'La dirección está incompleta y el domiciliario se pierde en la ruta.',
];

const WITH_NEGU = [
  'El cliente abre tu catálogo interactivo y elige todo en segundos.',
  'Selecciona método de entrega: domicilio o recogida en el local.',
  'Detecta el pin GPS exacto en el mapa para Google Maps y Waze.',
  'Suma total automática con costos de envío incluidos.',
  'Llega a tu WhatsApp como una comanda lista para pasar a cocina.',
];

export default function PedidosWhatsAppPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 font-sans antialiased">
      <SEO {...MARKETING_SEO.pedidosWhatsApp} />

      <MarketingNavbar />

      <main>
        <PageHero
          eyebrow="WhatsApp & GPS · Comandas 100% organizadas en tu chat"
          title="Sistema de pedidos por WhatsApp para"
          highlight="negocios y domicilios"
          description="Dile adiós a las conversaciones eternas preguntando precios, sabores y direcciones. Con NEGU tu cliente arma su carrito y tú recibes un único mensaje con la comanda lista, calculada y con ubicación GPS exacta."
          ctaTo="/registro"
          ctaLabel="Empezar a recibir pedidos organizados"
          note="Prueba 7 días gratis · Directo a tu número de WhatsApp"
        />

        {/* Comparativa */}
        <Section>
          <SectionHeader eyebrow="Ahorro de tiempo" title="El caos de vender por chat tradicional vs el método NEGU" />

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-rose-700">Sin NEGU · 10 a 15 mensajes por cliente</p>
              <ul className="mt-6 space-y-4 text-sm text-slate-700">
                {WITHOUT_NEGU.map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-px shrink-0 font-bold text-rose-500">✕</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-50 to-white p-6 shadow-xl shadow-sky-900/5 sm:p-8">
              <span className="absolute -top-3.5 right-6 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                Recomendado
              </span>
              <p className="text-xs font-extrabold uppercase tracking-wider text-sky-800">Con NEGU · 1 solo mensaje completo</p>
              <ul className="mt-6 space-y-4 text-sm font-medium text-slate-900">
                {WITH_NEGU.map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-px shrink-0 text-sky-700" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Anatomía de la comanda */}
        <Section muted>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-5 lg:col-span-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">La anatomía de la comanda</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                Así luce el mensaje de WhatsApp que recibe tu negocio
              </h2>
              <p className="leading-relaxed text-slate-600">
                Cada comanda enviada a través de NEGU viene ordenada con formato profesional, facilitando la preparación rápida de los alimentos y el despacho sin errores.
              </p>

              <ul className="space-y-4 pt-2">
                <IconRow icon={MessageCircle} tone="emerald" title="Número de pedido y resumen de productos">
                  Cantidades, nombres y notas especiales del cliente.
                </IconRow>
                <IconRow icon={Navigation} tone="sky" title="Enlace directo a Google Maps y Waze">
                  Tu domiciliario toca el enlace y abre la ruta sin escribir la dirección.
                </IconRow>
                <IconRow icon={ShieldCheck} tone="violet" title="Método de pago seleccionado">
                  Nequi, Daviplata, transferencia o efectivo (con monto a cambiar).
                </IconRow>
              </ul>
            </div>

            {/* Mockup de WhatsApp */}
            <div className="flex justify-center lg:col-span-6">
              <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-[#EFEAE2] p-4 shadow-2xl shadow-slate-900/10">
                <div className="space-y-2.5 rounded-xl bg-white p-4 font-mono text-xs text-slate-800 shadow-sm">
                  <p className="font-sans text-sm font-bold text-emerald-700">NUEVO PEDIDO #1082 · NEGU</p>
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <p><strong>Cliente:</strong> Carlos Mendoza</p>
                    <p><strong>Teléfono:</strong> +57 312 456 7890</p>
                    <p><strong>Entrega:</strong> A Domicilio</p>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <p><strong>PRODUCTOS:</strong></p>
                    <p>• 2x Burger Doble Carne ($38.000)</p>
                    <p className="pl-3 text-[10px] text-slate-500">+ Adicional Tocineta (+$4.000)</p>
                    <p className="pl-3 text-[10px] text-slate-500">+ Salsa de la casa</p>
                    <p>• 1x Papas Rústicas ($8.000)</p>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 pt-2 font-sans">
                    <p className="text-xs font-bold text-slate-900">TOTAL A PAGAR: $50.000 COP</p>
                    <p className="text-[11px] text-slate-600">Pago: Transferencia Nequi</p>
                  </div>
                  <div className="space-y-1 rounded-xl bg-emerald-50/80 p-2 font-sans">
                    <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                      <MapPin size={12} aria-hidden="true" /> Ubicación GPS del cliente:
                    </p>
                    <p className="truncate text-[10px] text-sky-700 underline">https://maps.google.com/?q=4.6512,-74.0841</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Enlaces internos */}
        <Section className="py-12 sm:py-14">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">Soluciones complementarias</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkCard to="/menu-digital" title="Menú digital para negocios" description="Catálogo interactivo con QR y fotos en alta resolución" />
            <LinkCard to="/gestion-de-pedidos" title="Gestión y control de pedidos" description="Panel administrativo con estados de comanda en vivo" />
          </div>
        </Section>
      </main>

      <CtaBand
        title="Recibe pedidos organizados a tu WhatsApp desde hoy"
        description="Configura tu número de WhatsApp y empieza a vender en 3 minutos."
        ctaTo="/registro"
        ctaLabel="Probar 7 días gratis"
      />

      <MarketingFooter />
    </div>
  );
}
