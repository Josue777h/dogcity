import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Printer, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function GestionPedidosPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans">
      <SEO 
        title="Gestión de pedidos para negocios | NEGU"
        description="Controla y organiza los pedidos de tu negocio en tiempo real. Estados de cocina, despachos a domicilio, recogida en tienda y reportes de ventas sin comisiones."
        canonical="https://negu.pro/gestion-de-pedidos"
      />

      <MarketingNavbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-gray-200/70 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-sky-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-xs mx-auto">
              <span className="bg-gray-950 text-[#11CEFC] text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                PANEL DE CONTROL
              </span>
              <span>Cero comandas perdidas en horas pico</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.05]">
              Gestión y control de pedidos en<br />
              <span className="font-semibold text-sky-700">
                tiempo real para negocios
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Administra el ciclo completo de tus ventas: desde que entra la comanda hasta que el domiciliario entrega en la puerta. Visualiza estados, imprime tickets térmicos y exporta tus ingresos sin complicaciones.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base px-5 py-3 rounded-lg border border-gray-800 shadow-card hover:shadow-sm transition-all duration-200 active:scale-95"
              >
                <Sparkles size={18} className="text-[#11CEFC]" />
                <span>Probar panel administrativo gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium pt-1">
              Prueba 7 días gratis · Funciona desde celular, tablet o computador
            </p>

          </div>
        </section>

        {/* ── CARACTERÍSTICAS DEL PANEL ── */}
        <section className="py-12 sm:py-16 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                Operación ágil
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Todo lo que necesitas para operar tu negocio como un profesional
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-200/80 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <ClipboardList size={22} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Estados de pedido en vivo</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pasa pedidos de <em>Pendiente</em> a <em>En preparación</em>, <em>En camino</em> o <em>Completado</em> con un solo toque. Tu equipo de cocina sabe exactamente qué preparar primero.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-50 border border-gray-200/80 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-[#0284C7] flex items-center justify-center">
                  <Printer size={22} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Impresión térmica Bluetooth & Comanda</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Conecta tu impresora térmica portátil Bluetooth (58mm o 80mm) para imprimir comandas instantáneas para cocina o facturas de entrega para el cliente.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gray-50 border border-gray-200/80 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet size={22} />
                </div>
                <h3 className="font-bold text-base text-gray-950">Reportes de ventas en Excel (CSV)</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Descarga el historial de pedidos con desglose de métodos de pago, totales diarios y productos más vendidos en un archivo compatible con Excel en 1 clic.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ── SEGUIMIENTO PARA EL CLIENTE ── */}
        <section className="py-12 sm:py-16 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                  Experiencia del cliente
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  Rastreo de pedido en vivo: reduce la ansiedad de tus compradores
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cada comanda incluye un enlace de seguimiento seguro. El cliente puede consultar en tiempo real si su pedido ya está en el horno, empacado o en manos del repartidor.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Evita llamadas insistentes preguntando "¿Ya salió mi pedido?".</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Visualización clara del método de entrega y resumen de artículos.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Totalmente adaptado a pantallas móviles.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-white border border-gray-200/80 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-900">Estado: En preparación</span>
                  </div>
                  <span className="text-xs text-gray-500">Pedido #1082</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0284C7] to-[#11CEFC] w-2/3 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>Recibido</span>
                    <span className="text-sky-600 font-bold">En Cocina</span>
                    <span>En Camino</span>
                    <span>Entregado</span>
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
              Otras áreas de la plataforma
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/para-restaurantes" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Software para restaurantes
                  </p>
                  <p className="text-xs text-gray-500">Comandas de cocina, cálculo de rutas y catálogo interactivo</p>
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
                  <p className="text-xs text-gray-500">Tiendas, cafeterías, reposterías y comercios locales</p>
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
              Toma el control de tus ventas y pedidos hoy
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Empieza tus 7 días de prueba gratis y organiza tu negocio como siempre quisiste.
            </p>
            <div>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-3 rounded-lg shadow-sm hover:scale-105 transition-all"
              >
                <span>Crear mi cuenta gratis</span>
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
