import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Smartphone, CheckCircle2,
  Check, ArrowRight, Menu, X,
  MapPin, Zap, Star, ChevronDown,
  ShoppingBag, Sparkles, DollarSign,
  Store, ShieldCheck, Clock,
  CreditCard, PackageCheck, Pizza, Coffee,
  Shirt, Cake, Fish, PawPrint, Beef, Navigation,
  ChevronRight, ExternalLink, Play, CheckCircle
} from 'lucide-react';
import camlyPreview from '../../assets/ejemplo.jpeg';
import SaaSLogo from '../../components/common/SaaSLogo';
import { useAnimatedCounter } from '../../lib/utils';

const BUSINESS_TYPES = [
  { icon: ShoppingBag, label: 'Comidas Rápidas' },
  { icon: Pizza,       label: 'Pizzerías & Pastas' },
  { icon: Coffee,      label: 'Cafeterías & Panaderías' },
  { icon: Fish,        label: 'Sushi & Wok' },
  { icon: Cake,        label: 'Reposterías & Postres' },
  { icon: Beef,        label: 'Carnicerías & Parrilla' },
  { icon: Shirt,       label: 'Boutiques & Ropa' },
  { icon: PawPrint,    label: 'Veterinarias & Mascotas' },
];

const FAQS = [
  {
    q: '¿Mis clientes tienen que descargar alguna aplicación?',
    a: 'No. Negu funciona directamente en el navegador web de cualquier teléfono móvil (Android o iPhone). Tu cliente abre tu enlace o escanea tu QR, arma su carrito y el pedido llega a tu WhatsApp con un solo clic.'
  },
  {
    q: '¿Cómo funciona la ubicación GPS para los domiciliarios?',
    a: 'Cuando el cliente selecciona servicio a domicilio, el catálogo interactivo detecta su ubicación GPS exacta y le permite ajustar su pin en el mapa. En el mensaje de WhatsApp que recibes viene el enlace directo que abre Google Maps o Waze en el celular de tu repartidor.'
  },
  {
    q: '¿Cómo recibo el dinero de mis ventas?',
    a: 'El 100% de tu dinero entra directamente a tus cuentas (Nequi, Daviplata, Bancolombia, Bre-B o efectivo contraentrega). Negu nunca retiene tu dinero ni te cobra porcentajes por transacción.'
  },
  {
    q: '¿Puedo actualizar precios o pausar productos en tiempo real?',
    a: 'Sí. Cuentas con un panel administrativo intuitivo accesible desde tu celular o computador donde puedes cambiar precios, subir fotos o activar/desactivar productos agotados en segundos.'
  },
  {
    q: '¿Qué necesito para empezar los 7 días de prueba gratis?',
    a: 'Solo el nombre de tu negocio, tu número de WhatsApp y tu correo electrónico. No solicitamos tarjeta de crédito ni firmas contratos de permanencia.'
  },
  {
    q: '¿Qué pasa si un cliente prefiere recoger en el local?',
    a: 'El cliente puede seleccionar "Recoger en tienda". El pedido llega con el horario estimado, lo que te permite tenerlo empacado y listo para entregar sin generar filas.'
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const orderCount = useAnimatedCounter(1420, 1500);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 selection:bg-cyan-500 selection:text-white font-sans">

      {/* ═══════════ TOP ANNOUNCEMENT BAR ═══════════ */}
      <div className="bg-gray-950 text-white text-xs py-2 px-3 sm:px-4 border-b border-gray-800/80 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-[#11CEFC] animate-pulse shrink-0" />
            <span className="font-medium text-gray-300 text-[11px] sm:text-xs">
              Prueba <strong className="text-white font-bold">7 días gratis</strong> · Sin tarjeta · Pagos directos a tu Nequi o cuenta
            </span>
          </div>
          <Link to="/registro" className="hidden sm:inline-flex items-center gap-1 text-[#11CEFC] hover:text-cyan-300 font-bold transition-colors shrink-0 text-xs">
            <span>Crear catálogo</span><ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ═══════════ STICKY NAVBAR ═══════════ */}
      <header className="sticky top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all duration-200">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
          <nav className="h-16 sm:h-20 flex items-center justify-between" aria-label="Navegación principal">
            
            {/* Logo Negu */}
            <Link to="/" className="flex items-center gap-2 shrink-0 py-1" aria-label="Ir al inicio de Negu">
              <SaaSLogo className="h-10 sm:h-12 md:h-14" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-600">
              <a href="#como-funciona" className="hover:text-cyan-600 transition-colors">Cómo funciona</a>
              <a href="#solucion"      className="hover:text-cyan-600 transition-colors">Ventajas</a>
              <a href="#comparativa"   className="hover:text-cyan-600 transition-colors">Antes vs Negu</a>
              <a href="#precios"       className="hover:text-cyan-600 transition-colors">Planes</a>
              <a href="#faq"           className="hover:text-cyan-600 transition-colors">Preguntas</a>
            </div>

            {/* Actions / CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to="/login" 
                className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-950 px-3 py-2 rounded-full transition-colors"
              >
                Entrar
              </Link>

              <Link 
                to="/registro" 
                className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full border border-gray-800 shadow-sm active:scale-95 transition-all duration-150"
              >
                <span>Probar gratis</span>
                <ArrowRight size={14} className="shrink-0 text-[#11CEFC]" />
              </Link>

              {/* Hamburger Button for Mobile */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="pb-4 pt-1 flex flex-col gap-1 text-sm font-semibold text-gray-700 md:hidden animate-fade-in-down border-t border-gray-100">
              <a 
                href="#como-funciona" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Cómo funciona
              </a>
              <a 
                href="#solucion" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Ventajas de Negu
              </a>
              <a 
                href="#comparativa" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Antes vs Con Negu
              </a>
              <a 
                href="#precios" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Planes y Precios
              </a>
              <a 
                href="#faq" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Preguntas frecuentes
              </a>
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full text-center py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gray-950 hover:bg-black rounded-xl border border-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Crear tienda gratis</span>
                  <ArrowRight size={14} className="text-[#11CEFC]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative pt-8 sm:pt-14 lg:pt-18 pb-16 sm:pb-24 overflow-hidden gradient-soft-cyan border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Eyebrow Pill Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 border border-blue-200/80 rounded-full pl-2 pr-3.5 py-1 text-xs font-semibold text-gray-700 shadow-sm mx-auto lg:mx-0">
                <span className="bg-blue-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full">
                  GPS & WHATSAPP
                </span>
                <span>Tu catálogo digital listo en menos de 3 minutos</span>
              </div>

              {/* Display Headline */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-[1.03]">
                Tu catálogo digital,<br />
                <span className="text-[#0284C7] text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-[#11CEFC]">listo en minutos</span><br />
                <span className="text-gray-600 font-sans text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight block mt-1">
                  conectado a WhatsApp.
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tus clientes arman su pedido interactivo y lo envían directo a tu WhatsApp con <strong className="text-gray-900 font-semibold">ubicación GPS exacta</strong> para el repartidor o recogida en tienda. Sin programar, sin contratos y con 0% de comisiones.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link 
                  to="/registro" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-sm sm:text-base px-8 py-4 rounded-full border border-gray-800 shadow-warm hover:shadow-glow-cyan transition-all duration-200 active:scale-95"
                >
                  <Sparkles size={18} className="text-[#11CEFC]" />
                  <span>Crear mi tienda gratis</span>
                  <ArrowRight size={16} />
                </Link>

                <a 
                  href="#como-funciona" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm sm:text-base px-7 py-4 rounded-full border border-gray-200/90 shadow-xs hover:border-gray-300 transition-all duration-150"
                >
                  <Play size={16} className="text-[#0284C7] fill-[#0284C7]" />
                  <span>Ver cómo funciona</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>0% comisiones por venta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Ruta GPS para Maps y Waze</span>
                </div>
              </div>

            </div>

            {/* Right Column: Realistic Interactive Device Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[310px] sm:max-w-[340px]">
                
                {/* Background Ambient Glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/25 via-sky-400/20 to-transparent rounded-[3rem] blur-2xl -z-10" />

                {/* Smartphone Mockup */}
                <div className="rounded-[2.8rem] p-3 bg-gray-950 shadow-2xl border-4 border-gray-800/90 transition-transform duration-300 hover:rotate-0 -rotate-1">
                  
                  {/* Speaker and Camera notch */}
                  <div className="relative rounded-[2.3rem] overflow-hidden bg-white aspect-[9/16] shadow-inner">
                    <img 
                      src={camlyPreview} 
                      alt="Vista previa catálogo Negu" 
                      className="w-full h-full object-cover object-top" 
                      loading="eager" 
                    />
                  </div>
                </div>

                {/* Floating Card 1: WhatsApp Incoming Order */}
                <div className="absolute -top-4 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-warm-lg border border-gray-200/80 flex items-center gap-3 animate-fade-in-down z-20 max-w-[240px]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">¡Nuevo Pedido WhatsApp!</p>
                    <p className="text-xs font-black text-gray-900 truncate">#1048 · 2x Burger Doble</p>
                    <p className="text-[10px] text-gray-500 font-medium">Total: $42.000 · Pago confirmado</p>
                  </div>
                </div>

                {/* Floating Card 2: GPS Location Pin */}
                <div className="absolute bottom-6 -right-4 sm:-right-8 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-warm-lg border border-gray-200/80 flex items-center gap-3 animate-fade-in-up z-20 max-w-[220px]">
                  <div className="w-10 h-10 rounded-xl bg-gray-950 text-[#11CEFC] border border-gray-800 flex items-center justify-center shrink-0 shadow-xs">
                    <Navigation size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Ruta Directa GPS</p>
                    <p className="text-xs font-black text-gray-900 truncate">Google Maps & Waze</p>
                    <p className="text-[10px] text-gray-500 font-medium">El repartidor va sin perderse</p>
                  </div>
                </div>

                {/* Floating Badge 3: 0% Commissions */}
                <div className="absolute -bottom-3 left-4 bg-gray-950 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 border border-gray-800">
                  <DollarSign size={13} className="text-[#11CEFC]" />
                  <span>0% comisiones sobre tus ventas</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════ CONTINUOUS TICKER MARQUEE ═══════════ */}
      <div className="bg-white border-b border-gray-200/80 py-4 overflow-hidden">
        <div className="flex items-center">
          <div className="shrink-0 px-5 sm:px-8 border-r border-gray-200">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Creado para
            </span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex gap-3 pl-4" style={{ animation: 'marquee-slide 34s linear infinite', width: 'max-content' }}>
              {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-50 border border-gray-200/70 text-gray-700 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
                  >
                    <Icon size={15} className="text-[#0284C7] shrink-0" />
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CÓMO FUNCIONA (THE 3-STEP FLOW) ═══════════ */}
      <section id="como-funciona" className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
              <Zap size={13} className="text-[#0284C7]" />
              <span>Flujo en 3 pasos sencillos</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              Así de simple es vender con Negu
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Tus clientes piden desde su celular en segundos y tú recibes la comanda completa en WhatsApp. Sin apps ni enredos.
            </p>
          </div>

          {/* 3 Step Editorial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Step 1 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-blue-300 hover:shadow-warm transition-all duration-200 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl sm:text-4xl font-black text-blue-600">01</span>
                <div className="w-12 h-12 rounded-2xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                  <Smartphone size={22} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Sube tus productos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Agrega categorías, fotos, precios y opciones personalizadas en minutos desde tu celular o computador.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-blue-300 hover:shadow-warm transition-all duration-200 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl sm:text-4xl font-black text-blue-600">02</span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Comparte tu enlace</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pon tu enlace en la biografía de Instagram, estados de WhatsApp o envíalo a quien te pregunte por el menú.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gray-50/70 border border-gray-200/80 hover:border-blue-300 hover:shadow-warm transition-all duration-200 space-y-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl sm:text-4xl font-black text-blue-600">03</span>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recibe pedidos listos</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  El pedido llega a tu WhatsApp con productos, total exacto, método de pago y el enlace GPS para el repartidor.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════ BENTO GRID: VENTAJAS Y VALOR ═══════════ */}
      <section id="solucion" className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle size={13} />
              <span>Diseñado para dueños de negocios</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              Todo lo que necesitas para vender más por WhatsApp
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Herramientas precisas para organizar tus ventas sin pagar el 30% a plataformas intermediarias.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Bento Card 1: GPS y Domicilios (Large) */}
            <div className="md:col-span-8 p-7 sm:p-9 rounded-3xl bg-white border border-gray-200/90 shadow-warm hover:shadow-warm-lg transition-all duration-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Navigation size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Cálculo de domicilio con pin GPS en el mapa</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                  Tu cliente marca su ubicación exacta en el mapa satelital. El sistema calcula la distancia por kilómetro desde tu local y envía la ruta directa para que tu repartidor abra Google Maps o Waze sin preguntar "¿por dónde queda tu casa?".
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Ruta Waze & Maps</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Cálculo exacto por KM</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Cero llamadas de repartidores</span>
              </div>
            </div>

            {/* Bento Card 2: 0% Comisiones (Small) */}
            <div className="md:col-span-4 p-7 sm:p-9 rounded-3xl bg-white border border-gray-200/90 shadow-warm hover:shadow-warm-lg transition-all duration-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">0% Comisiones</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tus ventas son 100% tuyas. Los clientes pagan directo a tu cuenta de Nequi, Daviplata o en efectivo.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl p-2.5">
                Conserva todo el margen de tus ventas.
              </div>
            </div>

            {/* Bento Card 3: Recogida en Local (Small) */}
            <div className="md:col-span-4 p-7 sm:p-9 rounded-3xl bg-white border border-gray-200/90 shadow-warm hover:shadow-warm-lg transition-all duration-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Store size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Recogida en tienda</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Permite a tus clientes pedir con anticipación para recoger en el local sin hacer filas.
                </p>
              </div>
            </div>

            {/* Bento Card 4: Panel en vivo (Large) */}
            <div className="md:col-span-8 p-7 sm:p-9 rounded-3xl bg-white border border-gray-200/90 shadow-warm hover:shadow-warm-lg transition-all duration-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Smartphone size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Control total desde tu celular en tiempo real</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                  Actualiza precios, sube fotos, oculta productos agotados y consulta el historial de ventas diarias sin depender de un programador o diseñador gráfico.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-gray-600">
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Sin reimprimir cartas</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Gestión de repartidores</span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100">Reportes de ingresos</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════ ANTES VS CON MOVE (COMPARATIVA) ═══════════ */}
      <section id="comparativa" className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
              <span>El antes y después</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              ¿Por qué los negocios eligen Negu?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Compara la diferencia entre atender por chat tradicional y contar con un catálogo automatizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Antes: Caos */}
            <div className="p-7 sm:p-9 rounded-3xl bg-rose-50/40 border border-rose-200/70 space-y-5">
              <div className="flex items-center gap-2.5 text-rose-700 font-extrabold text-sm uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>El método tradicional (Caos)</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <X size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>10 a 15 mensajes repetitivos por cada cliente preguntando precios y sabores.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>Direcciones incompletas que hacen que los domiciliarios se pierdan y tarden el doble.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>Fotos borrosas enviadas por chat que saturan la memoria del teléfono.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>Comisiones de hasta el 30% en apps de domicilios tradicionales.</span>
                </li>
              </ul>
            </div>

            {/* Después: Con Negu */}
            <div className="p-7 sm:p-9 rounded-3xl bg-sky-50/50 border-2 border-[#0284C7] shadow-warm space-y-5 relative">
              <div className="absolute -top-3.5 right-6 bg-gray-950 text-[#11CEFC] text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm border border-gray-800">
                Con Negu
              </div>
              <div className="flex items-center gap-2.5 text-sky-900 font-extrabold text-sm uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                <span>La experiencia Negu</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-900 font-medium">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
                  <span>Un solo mensaje de WhatsApp con la comanda lista, precios sumados y método de pago.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
                  <span>Pin GPS exacto que abre Waze o Google Maps en 1 toque en el celular del repartidor.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
                  <span>Catálogo rápido, elegante y con fotos profesionales que abre sin descargar nada.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
                  <span>0% comisiones. El dinero entra completo y directo a tu Nequi, Daviplata o cuenta.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════ PLANES Y PRECIOS ═══════════ */}
      <section id="precios" className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <span>Precios claros</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              Sin comisiones sorpresa. Paga mes a mes.
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Comienza hoy con 7 días de prueba completa. Cancela cuando quieras sin compromisos.
            </p>

            {/* Annual Billing Switch */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setBillingAnnual(false)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !billingAnnual ? 'bg-white shadow-xs text-blue-600 border border-gray-200' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingAnnual(true)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingAnnual ? 'bg-blue-600 text-white shadow-glow-blue' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>Anual</span>
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">Ahorra 2 meses</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Plan 1: Prueba Gratis */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-gray-200/90 shadow-warm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">Prueba Gratuita</h3>
                  <p className="text-xs text-gray-500">Conoce el sistema y pon tu tienda en línea</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl sm:text-5xl font-black text-gray-950">$0</span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">/ 7 días</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Catálogo interactivo completo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Recepción de pedidos a WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Cálculo GPS por kilómetro</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Sin tarjeta de crédito requerida</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/registro" 
                className="w-full py-3.5 px-6 rounded-full text-center text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Plan 2: Plan Pro */}
            <div className="p-7 sm:p-9 rounded-3xl bg-white border-2 border-blue-600 shadow-warm-lg flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm tracking-wider">
                MÁS POPULAR
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">Plan Profesional</h3>
                  <p className="text-xs text-blue-600 font-semibold">Todo ilimitado para negocios en crecimiento</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl sm:text-5xl font-black text-gray-950">
                    {billingAnnual ? '$49.000' : '$59.000'}
                  </span>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">COP / mes</span>
                </div>
                <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs sm:text-sm text-gray-800 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Productos y categorías ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Cálculo automático de domicilio GPS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Personalización con tu logo y colores</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Asignación de repartidores en tiempo real</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={16} className="text-blue-600 shrink-0" />
                    <span>Soporte prioritario por WhatsApp</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/registro" 
                className="w-full py-3.5 px-6 rounded-full text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-glow-blue transition-all"
              >
                Activar con 7 días gratis
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════ TESTIMONIOS ═══════════ */}
      <section className="py-16 sm:py-24 bg-white border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Rating side block */}
            <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" className="text-amber-400" />
                ))}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-snug">
                4.9 / 5 recomendado por negocios locales
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Emprendedores y restaurantes en Colombia mueven sus pedidos con Negu todos los días.
              </p>
              <Link 
                to="/registro" 
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0284C7] hover:text-sky-700 transition-colors"
              >
                <span>Únete a Negu hoy</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Testimonials cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="rounded-3xl border border-gray-200/80 bg-gray-50/60 p-6 space-y-4 hover:shadow-warm transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white text-xs font-black flex items-center justify-center shrink-0">
                    SR
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sandra Restrepo</p>
                    <p className="text-xs text-gray-500">Comidas Rápidas El Gordo · Bogotá</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  "Antes nos enredábamos porque los clientes daban direcciones incompletas por chat. Ahora todo llega organizado y el domiciliario va directo con el GPS."
                </p>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200/80 bg-gray-50/60 p-6 space-y-4 hover:shadow-warm transition-shadow duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-[#11CEFC] text-xs font-black flex items-center justify-center shrink-0 border border-gray-800">
                    MH
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Mauricio Henao</p>
                    <p className="text-xs text-gray-500">Pizzería Napolitana · Medellín</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  "Muchos clientes piden para pasar a recoger. El pedido ya está listo cuando llegan y nos pagan directo al Nequi sin pagarle porcentajes a nadie."
                </p>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={13} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════ PREGUNTAS FRECUENTES (FAQ ACCORDION) ═══════════ */}
      <section id="faq" className="py-16 sm:py-24 bg-gray-50/60 border-b border-gray-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">
              Respuestas rápidas
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full px-5 sm:px-6 py-4 text-left text-sm sm:text-base font-bold text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-[#0284C7]' : ''
                    }`} 
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════ CTA FINAL (HIGH IMPACT) ═══════════ */}
      <section className="py-20 sm:py-28 bg-gray-950 text-white relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-7">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
            <Sparkles size={14} className="text-[#11CEFC]" />
            <span>Únete a los negocios que ya venden con Negu</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Empieza a vender hoy.<br />
            <span className="text-[#11CEFC]">Tu catálogo conectado a WhatsApp.</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            En menos de 3 minutos tienes tu catálogo en línea con GPS, recogida en local y pedidos organizados a tu WhatsApp.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/registro" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#11CEFC] hover:bg-cyan-400 text-gray-950 font-black text-base px-9 py-4 rounded-full shadow-glow-cyan hover:scale-105 transition-all duration-200"
            >
              <span>Crear mi tienda en 3 minutos</span>
              <ArrowRight size={17} />
            </Link>
          </div>

          <p className="text-xs text-gray-500 font-medium pt-2">
            7 días de prueba gratis · Sin tarjeta de crédito · Cancela en cualquier momento
          </p>

        </div>
      </section>

      {/* ═══════════ FOOTER MINIMALISTA ═══════════ */}
      <footer className="py-10 bg-black text-gray-400 text-sm border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SaaSLogo className="h-8 text-white" />
            <span className="text-xs text-gray-500 hidden md:inline">
              · Catálogo digital y pedidos WhatsApp
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold">
            <Link to="/login"    className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link to="/registro" className="hover:text-white transition-colors">Crear tienda</Link>
            <Link to="/tracking" className="hover:text-white transition-colors">Rastreo de pedido</Link>
          </div>

          <p className="text-gray-500 text-xs text-center sm:text-right">
            © {new Date().getFullYear()} Negu. Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
