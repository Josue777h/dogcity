import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Pizza, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Printer, 
  Navigation, 
  DollarSign, 
  QrCode, 
  ChevronRight,
  Clock
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function ParaRestaurantesPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans">
      <SEO 
        title="Software para restaurantes | NEGU"
        description="Software integral para restaurantes, pizzerías y locales gastronómicos. Menú digital QR, comanda para cocina, impresión térmica y cálculo de ruta GPS."
        canonical="https://negu.pro/para-restaurantes"
      />

      <MarketingNavbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-gray-200/70 gradient-soft-cyan">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-orange-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-xs mx-auto">
              <span className="bg-orange-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                GASTRONOMÍA & COMIDA
              </span>
              <span>Diseñado para el ritmo de la cocina</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.05]">
              Software para restaurantes y<br />
              <span className="text-[#0284C7] text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-sky-600 to-[#11CEFC]">
                negocios gastronómicos
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              El sistema todo en uno para pizzerías, hamburgueserías, restaurantes y cafeterías. Menú digital interactivo en mesa o redes, comandas organizadas para cocina y ruta GPS para repartidores con 0% de comisiones.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-gray-800 shadow-warm hover:shadow-glow-cyan transition-all duration-200 active:scale-95"
              >
                <Sparkles size={18} className="text-[#11CEFC]" />
                <span>Digitalizar mi restaurante gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium pt-1">
              Prueba 7 días gratis · Sin comisiones por plato vendido
            </p>

          </div>
        </section>

        {/* ── FUNCIONALIDADES GASTRONÓMICAS ── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                Herramientas hechas para comida
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Funcionalidades pensadas para la vida real de un restaurante
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="p-7 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Flame size={20} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Modificadores y adicionales flexibles</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Permite a tus comensales elegir tipo de salsa, término de carne, sabor de helado (sin costo adicional) o añadir tocineta y queso extra con cobro automático sumado a la comanda.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Printer size={20} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Impresión térmica para cocina (Bluetooth)</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Imprime los pedidos directamente desde el teléfono o tablet a una impresora de comandas de 58mm u 80mm vía Bluetooth, sin cables ni servidores complejos.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Navigation size={20} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Ruta GPS para el domiciliario</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  El cliente coloca el pin exacto de su casa en el mapa. En el WhatsApp del repartidor aparece el enlace directo que abre Google Maps o Waze en 1 toque.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <QrCode size={20} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Menú QR en mesas & Recogida en local</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Ahorra costos de cartas de papel en mesa y permite a los clientes hacer pedidos para pasar a recoger empacados sin esperar filas en el mostrador.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ── COMPARATIVA DE RENTABILIDAD: 0% COMISIONES ── */}
        <section className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-warm space-y-8">
              <div className="max-w-2xl space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                  Protege tu margen de ganancia
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                  Deja de regalar hasta el 30% de tus ventas en comisiones
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Las aplicaciones de delivery tradicionales cobran entre el 20% y el 30% más IVA por cada plato que vendes. Con NEGU pagas una tarifa plana accesible y el 100% del dinero de tus clientes va directo a tu cuenta bancaria o Nequi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Apps tradicionales de comida</p>
                  <p className="text-2xl font-black text-rose-800">25% a 30% de comisión</p>
                  <p className="text-xs text-gray-600">Retención de pagos por semanas y clientes que nunca son tuyos.</p>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/50 border-2 border-emerald-500 space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Con NEGU</p>
                  <p className="text-2xl font-black text-emerald-700">0% de comisiones</p>
                  <p className="text-xs text-gray-700 font-medium">Cobras al instante directo a tu Nequi o Daviplata. La base de clientes es 100% tuya.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── ENLACES INTERNOS ── */}
        <section className="py-12 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Más soluciones recomendadas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/menu-digital" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Menú digital con código QR
                  </p>
                  <p className="text-xs text-gray-500">Cartas interactivas para celulares con actualización en tiempo real</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </Link>

              <Link 
                to="/para-negocios" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Software para pequeños negocios
                  </p>
                  <p className="text-xs text-gray-500">Solución para comercios locales, tiendas y emprendimientos</p>
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
              Lleva tu restaurante al siguiente nivel con NEGU
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Comienza hoy mismo tu prueba gratuita de 7 días.
            </p>
            <div>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-[#11CEFC] hover:bg-cyan-400 text-gray-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-glow-cyan hover:scale-105 transition-all"
              >
                <span>Probar para mi restaurante gratis</span>
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
