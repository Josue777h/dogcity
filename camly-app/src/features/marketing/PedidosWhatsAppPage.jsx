import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  MapPin, 
  Navigation, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Store, 
  Clock, 
  Smartphone, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function PedidosWhatsAppPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans">
      <SEO 
        title="Pedidos por WhatsApp para negocios | NEGU"
        description="Automatiza tus pedidos por WhatsApp. El cliente arma su carrito, comparte su ubicación GPS y tú recibes la comanda estructurada y calculada al instante."
        canonical="https://negu.pro/pedidos-whatsapp"
      />

      <MarketingNavbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-gray-200/70 gradient-soft-cyan">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-emerald-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-xs mx-auto">
              <span className="bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                WHATSAPP & GPS
              </span>
              <span>Comandas 100% organizadas en tu chat</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.05]">
              Sistema de pedidos por WhatsApp para<br />
              <span className="text-[#0284C7] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-sky-600 to-[#11CEFC]">
                negocios y domicilios
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Dile adiós a las conversaciones eternas preguntando precios, sabores y direcciones. Con NEGU tu cliente arma su carrito y tú recibes un único mensaje con la comanda lista, calculada y con ubicación GPS exacta.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-gray-800 shadow-warm hover:shadow-glow-cyan transition-all duration-200 active:scale-95"
              >
                <Sparkles size={18} className="text-[#11CEFC]" />
                <span>Empezar a recibir pedidos organizados</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium pt-1">
              Prueba 7 días gratis · Directo a tu número de WhatsApp
            </p>

          </div>
        </section>

        {/* ── EL PROBLEMA DE LOS PEDIDOS TRADICIONALES ── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                Ahorro de tiempo
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                El caos de vender por chat tradicional vs El método NEGU
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              
              {/* Sin NEGU */}
              <div className="p-7 rounded-3xl bg-rose-50/50 border border-rose-200/80 space-y-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                  Sin NEGU (10 a 15 mensajes por cliente)
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>El cliente saluda y pregunta "¿Qué sabores tienen?".</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Tienes que escribir o enviar una foto pesada con la carta.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>El cliente escribe su pedido por partes olvidando la salsa o bebida.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>Tienes que sumar los precios manualmente con calculadora.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>La dirección está incompleta y el domiciliario se pierde en la ruta.</span>
                  </li>
                </ul>
              </div>

              {/* Con NEGU */}
              <div className="p-7 rounded-3xl bg-sky-50/60 border-2 border-[#0284C7] space-y-4 shadow-xs">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0284C7]">
                  Con NEGU (1 solo mensaje completo)
                </p>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-800 font-medium">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <span>El cliente abre tu catálogo interactivo y elige todo en segundos.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <span>Selecciona método de entrega: domicilio o recogida en el local.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <span>Detecta el pin GPS exacto en el mapa para Google Maps y Waze.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <span>Suma total automática con costos de envío incluidos.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <span>Llega a tu WhatsApp como una comanda lista para pasar a cocina.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* ── CÓMO SE ESTRUCTURA EL PEDIDO EN WHATSAPP ── */}
        <section className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                  La anatomía de la comanda
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  Así luce el mensaje de WhatsApp que recibe tu negocio
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cada comanda enviada a través de NEGU viene ordenada con formato profesional, facilitando la preparación rápida de los alimentos y el despacho sin errores.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Número de pedido y resumen de productos</p>
                      <p className="text-xs text-gray-500">Cantidades, nombres y notas especiales del cliente.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Navigation size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Enlace directo a Google Maps y Waze</p>
                      <p className="text-xs text-gray-500">Tu domiciliario toca el enlace y abre la ruta sin escribir la dirección.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Método de pago seleccionado</p>
                      <p className="text-xs text-gray-500">Nequi, Daviplata, transferencia o efectivo (con monto a cambiar).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup del mensaje de WhatsApp */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-sm bg-[#EFEAE2] rounded-3xl p-4 shadow-xl border border-gray-300 space-y-3">
                  <div className="bg-white rounded-2xl p-4 shadow-xs text-xs space-y-2.5 font-mono text-gray-800">
                    <p className="font-bold text-emerald-700 font-sans text-sm">
                      🍔 ¡NUEVO PEDIDO #1082 - NEGU!
                    </p>
                    <div className="border-t border-gray-100 pt-2 space-y-1">
                      <p><strong>Cliente:</strong> Carlos Mendoza</p>
                      <p><strong>Teléfono:</strong> +57 312 456 7890</p>
                      <p><strong>Entrega:</strong> 🛵 A Domicilio</p>
                    </div>
                    <div className="border-t border-gray-100 pt-2 space-y-1">
                      <p><strong>PRODUCTOS:</strong></p>
                      <p>• 2x Burger Doble Carne ($38.000)</p>
                      <p className="text-[10px] text-gray-500 pl-3">+ Adicional Tocineta (+$4.000)</p>
                      <p className="text-[10px] text-gray-500 pl-3">+ Salsa de la casa</p>
                      <p>• 1x Papas Rústicas ($8.000)</p>
                    </div>
                    <div className="border-t border-gray-100 pt-2 space-y-1 font-sans">
                      <p className="font-bold text-gray-900 text-xs">
                        TOTAL A PAGAR: $50.000 COP
                      </p>
                      <p className="text-[11px] text-gray-600">Pago: Transferencia Nequi</p>
                    </div>
                    <div className="border-t border-gray-100 pt-2 bg-emerald-50/70 p-2 rounded-xl space-y-1 font-sans">
                      <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <MapPin size={12} /> Ubicación GPS del cliente:
                      </p>
                      <p className="text-[10px] text-blue-600 underline truncate">
                        https://maps.google.com/?q=4.6512,-74.0841
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── ENLACES INTERNOS ── */}
        <section className="py-12 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Soluciones complementarias
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/menu-digital" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Menú digital para negocios
                  </p>
                  <p className="text-xs text-gray-500">Catálogo interactivo con QR y fotos en alta resolución</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </Link>

              <Link 
                to="/gestion-de-pedidos" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Gestión y control de pedidos
                  </p>
                  <p className="text-xs text-gray-500">Panel administrativo con estados de comanda en vivo</p>
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
              Recibe pedidos organizados a tu WhatsApp desde hoy
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Configura tu número de WhatsApp y empieza a vender en 3 minutos.
            </p>
            <div>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-[#11CEFC] hover:bg-cyan-400 text-gray-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-glow-cyan hover:scale-105 transition-all"
              >
                <span>Probar 7 días gratis</span>
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
