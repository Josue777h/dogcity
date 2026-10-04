import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  Smartphone, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Clock, 
  Layers, 
  ChevronRight 
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function MenuDigitalPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans">
      <SEO 
        title="Menú digital para negocios | NEGU"
        description="Crea un menú digital interactivo para tu negocio. Fotos de alta calidad, precios en tiempo real y pedidos directos a WhatsApp sin descargar aplicaciones."
        canonical="https://negu.pro/menu-digital"
      />

      <MarketingNavbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-gray-200/70 gradient-soft-cyan">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-cyan-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-xs mx-auto">
              <span className="bg-gray-950 text-[#11CEFC] text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                CATÁLOGO EN LÍNEA
              </span>
              <span>Reemplaza los PDFs pesados y fotos borrosas</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.05]">
              Menú digital interactivo para<br />
              <span className="text-[#0284C7] text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-[#11CEFC]">
                negocios y restaurantes
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Tus clientes exploran tu carta desde su celular con fotos de alta calidad, eligen sus opciones o adicionales y arman su pedido en segundos sin descargar ninguna aplicación.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-gray-800 shadow-warm hover:shadow-glow-cyan transition-all duration-200 active:scale-95"
              >
                <Sparkles size={18} className="text-[#11CEFC]" />
                <span>Crear mi menú digital gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium pt-1">
              Prueba 7 días gratis · Sin contratos · Listo en 3 minutos
            </p>

          </div>
        </section>

        {/* ── QUÉ ES UN MENÚ DIGITAL ── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                  Tecnología para tu comercio
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  ¿Qué es un menú digital con NEGU y por qué supera al PDF tradicional?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Un menú digital en PDF es estático: los clientes tienen que hacer zoom, no suma los precios y no te permite actualizar un precio sin volver a diseñar y enviar el archivo a todos tus contactos.
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Con el <strong>menú digital interactivo de NEGU</strong>, tu negocio tiene un enlace web propio y un código QR que abre al instante en el navegador de cualquier teléfono (Android o iPhone), con carrito de compras integrado y cálculo exacto.
                </p>
              </div>

              {/* Comparativa Visual */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <XCircle size={18} />
                    <span>El problema del Menú en PDF o Imagen</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pesa megabytes, satura la memoria del cliente, desactualizado cuando cambias precios y requiere que el cliente calcule las cuentas manualmente por mensaje.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50/60 border-2 border-[#0284C7] space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-[#0284C7]" />
                    <span>El Menú Digital Interactivo de NEGU</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    Abre en 1 segundo, fotos profesionales, categorías ordenadas, modificadores de ingredientes y envía el pedido listo y calculado a tu WhatsApp.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
                Flujo intuitivo
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Cómo compran tus clientes con tu menú digital
              </h2>
              <p className="text-sm text-gray-600">
                Diseñado para que una persona haga su pedido en menos de 60 segundos sin fricciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0284C7] flex items-center justify-center font-bold">
                  <QrCode size={24} />
                </div>
                <h3 className="font-bold text-base text-gray-950">1. Escanea o abre tu enlace</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Desde tu biografía de Instagram, mensaje de WhatsApp, sticker QR en mesas o código en empaques. Abre directamente en el navegador.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <Layers size={24} />
                </div>
                <h3 className="font-bold text-base text-gray-950">2. Personaliza su producto</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Selecciona sabores, salsas, términos de cocción o adiciones con cobro extra automático. El carrito calcula los subtotales en tiempo real.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Zap size={24} />
                </div>
                <h3 className="font-bold text-base text-gray-950">3. Envío directo a WhatsApp</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  El cliente confirma si es para recoger o a domicilio, añade su ubicación GPS y el pedido entra a tu WhatsApp estructurado como comanda.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── BENEFICIOS PARA EL NEGOCIO ── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Ventajas para el dueño del negocio
              </h2>
              <p className="text-sm text-gray-600">
                Control total de tu catálogo desde tu propio celular o computador en tiempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="text-[#0284C7] font-bold text-sm flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>Agotados en 1 clic</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  ¿Se terminó un ingrediente? Desactiva el producto en segundos para evitar que los clientes lo pidan.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="text-[#0284C7] font-bold text-sm flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>Cambio de precios</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Actualiza tus precios al instante sin gastar en reimpresión de cartas de papel ni rediseño de PDFs.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="text-[#0284C7] font-bold text-sm flex items-center gap-1.5">
                  <Zap size={16} />
                  <span>0% comisiones</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Todo el dinero que ingresa es tuyo. Los clientes pagan a tu Nequi, Daviplata, Bancolombia o efectivo.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                <div className="text-[#0284C7] font-bold text-sm flex items-center gap-1.5">
                  <Smartphone size={16} />
                  <span>Código QR incluido</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Genera el QR de tu catálogo para imprimir en acrílicos de mesa, volantes, cajas o vitrinas.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── ENLACES INTERNOS RELACIONADOS ── */}
        <section className="py-12 bg-gray-50 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Explora más soluciones de NEGU
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/pedidos-whatsapp" 
                className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Pedidos por WhatsApp para negocios
                  </p>
                  <p className="text-xs text-gray-500">Cómo automatizar la comanda con GPS y WhatsApp</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </Link>

              <Link 
                to="/para-restaurantes" 
                className="p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Software para restaurantes y gastronomía
                  </p>
                  <p className="text-xs text-gray-500">Comandas para cocina, impresión térmica y domicilios</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 sm:py-20 bg-gray-950 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Crea tu menú digital hoy y simplifica tus ventas
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Empieza tus 7 días de prueba sin tarjeta de crédito ni contratos.
            </p>
            <div>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-[#11CEFC] hover:bg-cyan-400 text-gray-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-glow-cyan hover:scale-105 transition-all"
              >
                <span>Crear mi menú digital</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
