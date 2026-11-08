import React from 'react';
import { QrCode, Smartphone, XCircle, CheckCircle2, Zap, Clock, Layers } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { PageHero, Section, SectionHeader, FeatureCard, LinkCard, CtaBand } from './components/MarketingUI';
import { MARKETING_SEO } from './seo-pages';

export default function MenuDigitalPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 font-sans antialiased">
      <SEO {...MARKETING_SEO.menuDigital} />

      <MarketingNavbar />

      <main>
        <PageHero
          eyebrow="Catálogo en línea · Reemplaza los PDFs pesados y fotos borrosas"
          title="Menú digital interactivo para"
          highlight="negocios y restaurantes"
          description="Tus clientes exploran tu carta desde su celular con fotos de alta calidad, eligen sus opciones o adicionales y arman su pedido en segundos sin descargar ninguna aplicación."
          ctaTo="/registro"
          ctaLabel="Crear mi menú digital gratis"
          note="Prueba 7 días gratis · Sin contratos · Listo en 3 minutos"
        />

        {/* Qué es */}
        <Section>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Tecnología para tu comercio</span>
              <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                ¿Qué es un menú digital con NEGU y por qué supera al PDF tradicional?
              </h2>
              <p className="leading-relaxed text-slate-600">
                Un menú digital en PDF es estático: los clientes tienen que hacer zoom, no suma los precios y no te permite actualizar un precio sin volver a diseñar y enviar el archivo a todos tus contactos.
              </p>
              <p className="leading-relaxed text-slate-600">
                Con el <strong className="text-slate-900">menú digital interactivo de NEGU</strong>, tu negocio tiene un enlace web propio y un código QR que abre al instante en el navegador de cualquier teléfono (Android o iPhone), con carrito de compras integrado y cálculo exacto.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                  <XCircle size={18} aria-hidden="true" />
                  <span>El problema del menú en PDF o imagen</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Pesa megabytes, satura la memoria del cliente, queda desactualizado cuando cambias precios y obliga al cliente a calcular las cuentas manualmente por mensaje.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-sky-600 bg-white p-6 shadow-xl shadow-sky-900/10">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <CheckCircle2 size={18} className="text-sky-700" aria-hidden="true" />
                  <span>El menú digital interactivo de NEGU</span>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                  Abre en 1 segundo, fotos profesionales, categorías ordenadas, modificadores de ingredientes y envía el pedido listo y calculado a tu WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Cómo funciona */}
        <Section muted>
          <SectionHeader eyebrow="Flujo intuitivo" title="Cómo compran tus clientes con tu menú digital">
            Diseñado para que una persona haga su pedido en menos de 60 segundos sin fricciones.
          </SectionHeader>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard icon={QrCode} tone="sky" title="1. Escanea o abre tu enlace">
              Desde tu biografía de Instagram, mensaje de WhatsApp, sticker QR en mesas o código en empaques. Abre directamente en el navegador.
            </FeatureCard>
            <FeatureCard icon={Layers} tone="cyan" title="2. Personaliza su producto">
              Selecciona sabores, salsas, términos de cocción o adiciones con cobro extra automático. El carrito calcula los subtotales en tiempo real.
            </FeatureCard>
            <FeatureCard icon={Zap} tone="emerald" title="3. Envío directo a WhatsApp">
              El cliente confirma si es para recoger o a domicilio, añade su ubicación GPS y el pedido entra a tu WhatsApp estructurado como comanda.
            </FeatureCard>
          </div>
        </Section>

        {/* Beneficios */}
        <Section>
          <SectionHeader eyebrow="Para el dueño" title="Ventajas para el dueño del negocio">
            Control total de tu catálogo desde tu propio celular o computador en tiempo real.
          </SectionHeader>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Clock} tone="amber" title="Agotados en 1 clic">
              ¿Se terminó un ingrediente? Desactiva el producto en segundos para evitar que los clientes lo pidan.
            </FeatureCard>
            <FeatureCard icon={Layers} tone="sky" title="Cambio de precios">
              Actualiza tus precios al instante sin gastar en reimpresión de cartas de papel ni rediseño de PDFs.
            </FeatureCard>
            <FeatureCard icon={Zap} tone="emerald" title="0% comisiones">
              Todo el dinero que ingresa es tuyo. Los clientes pagan a tu Nequi, Daviplata, Bancolombia o efectivo.
            </FeatureCard>
            <FeatureCard icon={Smartphone} tone="indigo" title="Código QR incluido">
              Genera el QR de tu catálogo para imprimir en acrílicos de mesa, volantes, cajas o vitrinas.
            </FeatureCard>
          </div>
        </Section>

        {/* Enlaces internos */}
        <Section muted className="py-12 sm:py-14">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-500">Explora más soluciones de NEGU</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LinkCard to="/pedidos-whatsapp" title="Pedidos por WhatsApp para negocios" description="Cómo automatizar la comanda con GPS y WhatsApp" />
            <LinkCard to="/para-restaurantes" title="Software para restaurantes y gastronomía" description="Comandas para cocina, impresión térmica y domicilios" />
          </div>
        </Section>
      </main>

      <CtaBand
        title="Crea tu menú digital hoy y simplifica tus ventas"
        description="Empieza tus 7 días de prueba sin tarjeta de crédito ni contratos."
        ctaTo="/registro"
        ctaLabel="Crear mi menú digital"
      />

      <MarketingFooter />
    </div>
  );
}
