import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Share2, 
  CreditCard, 
  Clock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function ParaNegociosPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans">
      <SEO 
        title="Software para negocios | NEGU"
        description="Plataforma para tiendas, cafeterías, reposterías y comercios locales. Catálogo digital, control de inventario y recepción organizada de pedidos a WhatsApp."
        canonical="https://negu.pro/para-negocios"
      />

      <MarketingNavbar />

      <main>
        {/* ── HERO SECTION ── */}
        <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-gray-200/70 gradient-soft-cyan">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-white/90 border border-sky-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-xs mx-auto">
              <span className="bg-gray-950 text-[#11CEFC] text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                COMERCIO & RETAIL
              </span>
              <span>Para todo tipo de emprendimientos y tiendas</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.05]">
              Software para pequeños negocios y<br />
              <span className="text-[#0284C7] text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-[#11CEFC]">
                comercios locales
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              NEGU no es solo para restaurantes. Si vendes productos físicos, repostería, ropa, accesorios, licores o regalos, crea tu catálogo digital profesional y recibe pedidos organizados directo a tu WhatsApp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-gray-800 shadow-warm hover:shadow-glow-cyan transition-all duration-200 active:scale-95"
              >
                <Sparkles size={18} className="text-[#11CEFC]" />
                <span>Crear catálogo para mi negocio gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="text-xs text-gray-500 font-medium pt-1">
              Prueba 7 días gratis · Sin contratos ni conocimientos técnicos
            </p>

          </div>
        </section>

        {/* ── QUÉ TIPO DE NEGOCIOS USAN NEGU ── */}
        <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                Versatilidad total
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                Diseñado para el comercio moderno de cualquier categoría
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-[#0284C7] flex items-center justify-center font-bold">
                  👗
                </div>
                <h3 className="font-bold text-base text-gray-950">Tiendas de ropa y calzado</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Muestra tus colecciones con fotos nítidas, tallas, colores disponibles y recibe el pedido exacto por WhatsApp.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🎂
                </div>
                <h3 className="font-bold text-base text-gray-950">Reposterías y pastelerías</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Permite a tus clientes elegir sabores de tortas, rellenos, tamaños y notas de dedicatoria personalizadas.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ☕
                </div>
                <h3 className="font-bold text-base text-gray-950">Cafés, panaderías y minimarkets</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Facilita pedidos express para pasar a recoger de camino al trabajo o despachos a domicilio cercanos con GPS.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  🎁
                </div>
                <h3 className="font-bold text-base text-gray-950">Regalos y anchetas sorpresa</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Agrupa anchetas por ocasión (cumpleaños, aniversarios) con adiciones de chocolates o globos.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  🍷
                </div>
                <h3 className="font-bold text-base text-gray-950">Licoreras y estancos</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Atención rápida a deshoras. Tus clientes eligen sus botellas y hielo y te llega la dirección en 1 segundo.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  🐾
                </div>
                <h3 className="font-bold text-base text-gray-950">Veterinarias y pet shops</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Venta de concentrados, snacks y accesorios para mascotas con despacho rápido a domicilio.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ── CÓMO POTENCIA TUS REDES SOCIALES ── */}
        <section className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0284C7]">
                  Ventas en automático
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  Convierte a tus seguidores de Instagram y TikTok en compradores reales
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Coloca tu enlace oficial de NEGU (ej: <code>negu.pro/mitienda</code>) en tu biografía de redes sociales. Cuando alguien se interese en tus publicaciones, abre tu tienda interactiva y te envía el pedido directo a WhatsApp.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Tu catálogo vende mientras atiendes en el local o descansas.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Calcula subtotales exactos evitando errores de cobro.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#0284C7]" />
                    <span>Sin descargar aplicaciones pesadas ni registros molestos para el cliente.</span>
                  </div>
                </div>
              </div>

              <div className="p-7 rounded-3xl bg-white border border-gray-200/80 shadow-md space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-[#0284C7] flex items-center justify-center font-bold">
                    <Share2 size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Enlace oficial para tu perfil</p>
                    <p className="text-xs text-gray-500">Compatible con Instagram, TikTok, WhatsApp Business y Facebook</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs font-mono text-gray-700 flex items-center justify-between border border-gray-200">
                  <span className="truncate text-sky-700 font-semibold">https://negu.pro/tu-marca</span>
                  <span className="text-[11px] bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500">Activo</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cada vez que un cliente toca tu enlace, entra a tu catálogo moderno con los colores y logo de tu negocio.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── ENLACES INTERNOS ── */}
        <section className="py-12 bg-white border-b border-gray-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Otras soluciones de la plataforma
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/pedidos-whatsapp" 
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                    Pedidos por WhatsApp
                  </p>
                  <p className="text-xs text-gray-500">Comandas calculadas y ubicación GPS para domiciliarios</p>
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
                  <p className="text-xs text-gray-500">Panel administrativo con reportes en Excel y seguimiento</p>
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
              Moderniza la forma de vender en tu negocio con NEGU
            </h2>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
              Empieza tus 7 días de prueba gratis y sube tus productos en menos de 5 minutos.
            </p>
            <div>
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 bg-[#11CEFC] hover:bg-cyan-400 text-gray-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-glow-cyan hover:scale-105 transition-all"
              >
                <span>Crear mi tienda gratis</span>
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
