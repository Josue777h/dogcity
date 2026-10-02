import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Smartphone, CheckCircle2,
  Check, ArrowRight, Menu, X,
  MapPin, Zap, Star, ChevronDown,
  ShoppingBag, Sparkles, DollarSign,
  Store, ShieldCheck,
  CreditCard, PackageCheck, Pizza, Coffee,
  Shirt, Cake, Fish, PawPrint, Beef, Navigation,
} from 'lucide-react';
import camlyPreview from '../../assets/ejemplo.jpeg';
import SaaSLogo from '../../components/common/SaaSLogo';
import { useAnimatedCounter } from '../../lib/utils';

const BUSINESS_TYPES = [
  { icon: ShoppingBag, label: 'Comidas Rapidas' },
  { icon: Pizza,       label: 'Pizzerias' },
  { icon: Coffee,      label: 'Cafeterias y Panaderias' },
  { icon: Shirt,       label: 'Tiendas de Ropa' },
  { icon: Cake,        label: 'Reposterias' },
  { icon: Fish,        label: 'Sushi y Oriental' },
  { icon: PawPrint,    label: 'Mascotas' },
  { icon: Beef,        label: 'Carnes y Frutas' },
];

const FAQS = [
  {
    q: 'Mis clientes tienen que descargar alguna aplicacion?',
    a: 'No. CAMLY funciona directamente en el navegador de cualquier celular. Tu cliente abre tu enlace, agrega productos al carrito y el pedido llega a tu WhatsApp en segundos.'
  },
  {
    q: 'Como funciona la ubicacion GPS para los domicilios?',
    a: 'Cuando el cliente elige domicilio, el sistema lee su ubicacion GPS. En el WhatsApp que recibes viene el enlace directo para abrir Google Maps o Waze con la ruta exacta para tu repartidor.'
  },
  {
    q: 'Que pasa si el cliente prefiere recoger en el local?',
    a: 'El cliente selecciona Recoger en el punto. El pedido llega a WhatsApp con el detalle completo, permitiendote tenerlo empacado y listo antes de que llegue.'
  },
  {
    q: 'Como recibo el dinero de mis ventas?',
    a: 'El 100% del dinero entra directo a ti. Tus clientes pagan por Nequi, Daviplata, Bancolombia o en efectivo. CAMLY no retiene ni descuenta comision.'
  },
  {
    q: 'Que necesito para empezar los 7 dias de prueba gratis?',
    a: 'Solo el nombre de tu negocio, correo y contrasena. Sin tarjeta de credito. En menos de 5 minutos tienes tu catalogo al aire.'
  },
  {
    q: 'Puedo actualizar precios y productos desde mi telefono?',
    a: 'Si. Tienes un panel donde puedes subir fotos, ajustar precios o pausar productos agotados al instante.'
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
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900 selection:bg-orange-500 selection:text-white font-sans">

      {/* TOP BAR */}
      <aside className="bg-gray-950 text-white text-xs py-2 px-4 border-b border-gray-800">
        <div className="fluid-container flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-gray-300">
              Prueba <strong className="text-white font-bold">7 dias gratis</strong> · Sin tarjeta · Pagos directos a tu Nequi o cuenta
            </span>
          </div>
          <Link to="/registro" className="hidden sm:inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold transition-colors">
            <span>Crear catalogo</span><ArrowRight size={12} />
          </Link>
        </div>
      </aside>

      {/* NAVBAR */}
      <nav className={`sticky top-0 left-0 w-full z-[100] transition-all duration-200 border-b ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-gray-200/80' : 'bg-white py-3.5 border-gray-100'
      }`}>
        <div className="fluid-container flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2"><SaaSLogo className="h-7 shrink-0" /></Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
            <a href="#como-funciona" className="hover:text-orange-600 transition-colors">Como funciona</a>
            <a href="#entregas"      className="hover:text-orange-600 transition-colors">Envios y Retiros</a>
            <a href="#beneficios"    className="hover:text-orange-600 transition-colors">Ventajas</a>
            <a href="#precios"       className="hover:text-orange-600 transition-colors">Planes</a>
            <a href="#preguntas"     className="hover:text-orange-600 transition-colors">Preguntas</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl transition-colors">Iniciar sesion</Link>
            <Link to="/registro" className="btn-primary py-2.5 px-4 text-sm font-bold shadow-sm"><span>Empezar gratis</span><ArrowRight size={14} /></Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-600 rounded-xl hover:bg-gray-100">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-5 space-y-1 animate-fade-in-down shadow-xl">
            {['#como-funciona:Como funciona','#entregas:Envios y Retiros','#beneficios:Ventajas','#precios:Planes','#preguntas:Preguntas'].map(s => {
              const [href, label] = s.split(':');
              return <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-bold text-gray-800 border-b border-gray-50">{label}</a>;
            })}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-secondary w-full text-center py-2.5 text-sm font-bold">Iniciar sesion</Link>
              <Link to="/registro" onClick={() => setMenuOpen(false)} className="btn-primary  w-full text-center py-2.5 text-sm font-bold">Crear mi tienda gratis</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="pt-10 sm:pt-14 pb-12 sm:pb-16 bg-radial from-orange-50/40 via-white to-white border-b border-gray-100">
        <div className="fluid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            <div className="lg:col-span-7 text-center lg:text-left space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-950 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                <span>Mas de {orderCount.toLocaleString()} pedidos despachados con exito</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
                Tu catalogo digital para vender por WhatsApp <span className="text-orange-600">con GPS y sin enredos</span>
              </h1>
              <p className="text-base text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Tus clientes eligen productos desde tu enlace y el pedido llega a tu WhatsApp completamente listo: productos, total y ubicacion GPS para el repartidor.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link to="/registro" className="btn-primary py-3.5 px-7 text-sm font-bold w-full sm:w-auto shadow-md gap-2"><span>Probar 7 dias gratis</span><ArrowRight size={16} /></Link>
                <a href="#como-funciona" className="btn-secondary py-3.5 px-6 text-sm font-bold w-full sm:w-auto">Ver como funciona</a>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-600 shrink-0" /><span>Sin descargar apps</span></div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-600 shrink-0" /><span>GPS para Google Maps</span></div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-600 shrink-0" /><span>0% comisiones</span></div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
                <div className="absolute -top-6 -left-3 sm:-left-6 z-20 bg-white shadow-xl rounded-2xl p-3 border border-gray-200/90 max-w-[240px] animate-scale-in">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">WA</div>
                    <div><p className="text-[11px] font-extrabold text-gray-900 leading-none">WhatsApp Business</p><p className="text-[9px] text-gray-400">Nuevo pedido recibido</p></div>
                  </div>
                  <div className="text-[11px] text-gray-800 font-semibold space-y-1">
                    <p className="font-bold text-gray-900">Pedido #1042</p>
                    <p className="text-gray-600">2x Hamburguesa Doble Queso</p>
                    <p className="text-gray-600">1x Papas Rusticas</p>
                    <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800">GPS: maps.google.com/?q=...</div>
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                      <span className="text-[10px] text-gray-500">Nequi / Efectivo</span>
                      <strong className="text-gray-900 text-xs font-black">$38.000</strong>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-2 z-20 bg-gray-950 text-white shadow-xl rounded-xl p-2.5 border border-gray-800 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shrink-0"><DollarSign size={16} /></div>
                  <div><p className="text-[11px] font-bold">Cero Comisiones</p><p className="text-[10px] text-gray-400">100% para ti</p></div>
                </div>
                <div className="rounded-[2.5rem] p-3 bg-gray-950 shadow-2xl border-4 border-gray-800">
                  <div className="relative rounded-[2rem] overflow-hidden bg-white aspect-[9/16]">
                    <img src={camlyPreview} alt="Vista previa catalogo CAMLY" className="w-full h-full object-cover object-top" loading="eager" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STRIP MARQUEE */}
      <div className="bg-gray-950 border-b border-gray-800 py-4 overflow-hidden">
        <div className="flex items-center">
          <div className="shrink-0 px-5 border-r border-gray-700">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Ideal para</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
            <div className="flex gap-3 pl-4" style={{ animation: 'marquee-slide 32s linear infinite', width: 'max-content' }}>
              {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700/60 text-gray-300 text-sm font-medium whitespace-nowrap shrink-0">
                    <Icon size={14} className="text-orange-400 shrink-0" />{item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ COMO FUNCIONA ═══════════ */}
      <section id="como-funciona" className="py-14 sm:py-20 bg-white border-b border-gray-100 overflow-hidden">
        <div className="fluid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: title block */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-950 text-xs font-bold">
                <Zap size={12} className="text-orange-600" />
                <span>Listo en 5 minutos</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">Asi de simple es vender con Camly</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Tus clientes piden desde su celular y tu recibes todo listo en WhatsApp. Sin apps, sin intermediarios.</p>
              <Link to="/registro" className="btn-primary py-3 px-5 text-sm font-bold shadow-sm gap-2 mt-2 inline-flex"><span>Probar gratis</span><ArrowRight size={14} /></Link>
            </div>

            {/* Right: steps */}
            <div className="lg:col-span-8 space-y-4">
              {[
                { n: '01', t: 'Sube tus productos', d: 'Agrega categorias, fotos y precios en minutos. Desde tu celular o computador, organizas tu catalogo completo.', icon: Smartphone, color: 'orange' },
                { n: '02', t: 'Comparte tu enlace', d: 'Ponlo en tu biografia de Instagram, estado de WhatsApp o envialo directo a quien te pregunte que vendes.', icon: MessageCircle, color: 'blue' },
                { n: '03', t: 'Recibe pedidos listos', d: 'El pedido llega a tu WhatsApp con productos, total, metodo de pago y enlace GPS para el repartidor.', icon: CheckCircle2, color: 'emerald' },
              ].map(({ n, t, d, icon: Icon, color }) => (
                <div key={n} className="group relative flex gap-5 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200">
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-black text-gray-300 tracking-widest">{n}</span>
                      <h3 className="text-base font-bold text-gray-900">{t}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{d}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 shrink-0 mt-1.5 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ENTREGAS ═══════════ */}
      <section id="entregas" className="py-14 sm:py-20 bg-white border-b border-gray-100">
        <div className="fluid-container">
          <div className="max-w-xl mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Modalidades de entrega</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">El pedido llega listo a tu WhatsApp</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domicilio */}
            <div className="relative">
              <div className="border-l-[3px] border-orange-500 pl-6 sm:pl-8 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Domicilio</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 leading-snug">Tu cliente comparte su ubicacion y el pedido llega con la ruta incluida</h3>
                </div>
                <div className="space-y-2">
                  {['El cliente marca su punto en el mapa desde el celular','La ubicacion GPS llega dentro del pedido a tu WhatsApp','Tu repartidor abre Google Maps directo desde el mensaje','No necesitas preguntar donde queda ni pedir referencias'].map((item, i) => (
                    <p key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-2" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              {/* WhatsApp preview */}
              <div className="mt-5 ml-6 sm:ml-8 p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">WA</div>
                  <span className="text-[11px] font-bold text-gray-300">Nuevo pedido</span>
                  <span className="text-[10px] text-gray-600 ml-auto">Hace 1 min</span>
                </div>
                <div className="text-[11px] text-gray-400 space-y-1.5 font-medium">
                  <p className="text-white font-bold">Pedido #1042 · Domicilio</p>
                  <p>2x Hamburguesa Doble · 1x Papas Rusticas</p>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-900 rounded-lg text-emerald-400 text-[10px] border border-gray-800">
                    <MapPin size={10} className="shrink-0" /><span className="truncate">maps.google.com/?q=4.6521,-74.0836</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-gray-500">Nequi · Efectivo</span>
                    <span className="text-white font-black text-xs">$38.000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recoger */}
            <div className="relative">
              <div className="border-l-[3px] border-gray-900 pl-6 sm:pl-8 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Recoger en local</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1 leading-snug">Tu cliente pide antes de llegar y recoge cuando este listo</h3>
                </div>
                <div className="space-y-2">
                  {['El pedido llega organizado con cada producto y cantidad','Cada pedido tiene un numero unico de identificacion','Lo preparas con anticipacion, sin esperas en mostrador','El cliente llega, recoge y se va. Sin filas ni confusiones'].map((item, i) => (
                    <p key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-2" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>
              {/* WhatsApp preview */}
              <div className="mt-5 ml-6 sm:ml-8 p-4 bg-gray-950 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-800">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">WA</div>
                  <span className="text-[11px] font-bold text-gray-300">Nuevo pedido</span>
                  <span className="text-[10px] text-gray-600 ml-auto">Hace 3 min</span>
                </div>
                <div className="text-[11px] text-gray-400 space-y-1.5 font-medium">
                  <p className="text-white font-bold">Pedido #1043 · Recoger en local</p>
                  <p>1x Pizza Napolitana · 2x Gaseosa 400ml</p>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-900 rounded-lg text-gray-400 text-[10px] border border-gray-800">
                    <Store size={10} className="shrink-0" /><span>El cliente pasa a recoger al local</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-gray-500">Transferencia Nequi</span>
                    <span className="text-white font-black text-xs">$42.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRECIOS (moved up for conversion) ═══════════ */}
      <section id="precios" className="py-14 sm:py-20 bg-white border-b border-gray-100">
        <div className="fluid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: copy */}
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck size={12} />
                <span>Tarifa plana · 0% comisiones</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">Un solo plan.<br />Todo incluido.</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Sin letra pequena, sin cobros sorpresa. El 100% de lo que vendes es tuyo. Solo pagas la suscripcion mensual o anual.</p>

              <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl text-sm font-bold">
                <button onClick={() => setBillingAnnual(false)} className={`px-4 py-2 rounded-lg transition-all ${!billingAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Mensual</button>
                <button onClick={() => setBillingAnnual(true)}  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${billingAnnual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  <span>Anual</span><span className="bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-bold">-25%</span>
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight">{billingAnnual ? '$29.000' : '$39.000'}</span>
                <div className="text-left">
                  <span className="block text-sm text-gray-500 font-bold">COP</span>
                  <span className="block text-xs text-gray-400">por mes</span>
                </div>
              </div>
              <p className="text-sm text-emerald-700 font-bold">{billingAnnual ? 'Facturado anualmente ($348.000/ano)' : 'Cancela cuando quieras · Sin contrato'}</p>

              <Link to="/registro" className="btn-primary py-3.5 px-7 text-sm font-bold shadow-md gap-2 w-full sm:w-auto"><span>Empezar 7 dias gratis</span><ArrowRight size={15} /></Link>
              <p className="text-xs text-gray-400 font-medium">Sin tarjeta de credito · Activacion en 5 minutos</p>
            </div>

            {/* Right: feature list */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5">Todo incluido en tu plan</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                  {[
                    { t: 'Catalogo con tu logo y colores', sub: 'Personalizable al 100%' },
                    { t: 'GPS automatico en domicilios', sub: 'Ubicacion exacta del cliente' },
                    { t: 'Recogida en local', sub: 'Pedido listo antes de llegar' },
                    { t: '0% comision por pedido', sub: 'El 100% de la venta es tuya' },
                    { t: 'Nequi, Daviplata, banco, efectivo', sub: 'Tus clientes eligen como pagar' },
                    { t: 'Productos y categorias ilimitados', sub: 'Sin restricciones de catalogo' },
                    { t: 'Panel de ventas y metricas', sub: 'Control total en tiempo real' },
                    { t: 'Soporte directo por WhatsApp', sub: 'Respuesta rapida y personalizada' },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <div className="w-5 h-5 rounded-md bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5"><Check size={12} strokeWidth={3} /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{feat.t}</p>
                        <p className="text-xs text-gray-500">{feat.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFICIOS ═══════════ */}
      <section id="beneficios" className="py-14 sm:py-20 bg-gray-50/80 border-b border-gray-200/80">
        <div className="fluid-container">
          <div className="max-w-2xl mb-10 space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-950 text-xs font-bold">
              <Star size={12} className="text-orange-600" />
              <span>Ventajas de usar Camly</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">Todo lo que necesita tu negocio para vender por WhatsApp</h2>
          </div>

          {/* Feature cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { icon: CreditCard, color: 'emerald', t: 'Cobros directos a tu cuenta', d: 'Nequi, Daviplata o Bancolombia. Sin intermediarios.', badge: '0% comisiones', badgeIcon: ShieldCheck },
              { icon: Smartphone, color: 'orange', t: 'Abre en 1 segundo', d: 'Sin descargar apps. Funciona en cualquier telefono.', badge: 'iPhone y Android', badgeIcon: Zap },
              { icon: MessageCircle, color: 'blue', t: 'Soporte en espanol', d: 'Atencion directa por WhatsApp para resolver cualquier duda.', badge: 'Respuesta rapida', badgeIcon: CheckCircle2 },
            ].map(({ icon: Icon, color, t, d, badge, badgeIcon: BadgeIcon }, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow duration-200">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm ${
                  color === 'emerald' ? 'bg-emerald-600' : color === 'orange' ? 'bg-orange-600' : 'bg-blue-600'
                }`}><Icon size={20} /></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{t}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{d}</p>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  color === 'emerald' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  color === 'orange' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                  'bg-blue-50 text-blue-800 border-blue-200'
                }`}><BadgeIcon size={12} /><span>{badge}</span></div>
              </div>
            ))}
          </div>

          {/* Full-width dark panel card */}
          <div className="rounded-2xl bg-gray-950 border border-gray-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-600/20 text-orange-400 text-xs font-bold"><Zap size={13} /><span>Control total desde tu celular</span></div>
              <h3 className="text-lg font-bold text-white">Panel de ventas y control de productos</h3>
              <p className="text-sm text-gray-400 max-w-lg">Pausa productos agotados, ajusta precios y revisa los pedidos del dia. Todo desde tu telefono, sin cuadernos ni libretas.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" /><span className="font-semibold text-gray-200">Hamburguesa Doble: Activa</span></div>
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center gap-3 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" /><span className="font-semibold text-gray-400">Jugo de Naranja: Pausado</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIOS ═══════════ */}
      <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
        <div className="fluid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: rating block */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" className="text-orange-500" />)}
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-snug">4.9 / 5 recomendado por duenos de negocios</h2>
              <p className="text-sm text-gray-500 leading-relaxed">Negocios en Colombia ya reciben pedidos organizados con Camly todos los dias.</p>
              <Link to="/registro" className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"><span>Unirme ahora</span><ArrowRight size={14} /></Link>
            </div>

            {/* Right: testimonials */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Sandra Restrepo', biz: 'Comidas Rapidas El Gordo · Bogota', initials: 'SR', color: 'bg-orange-600', quote: 'Antes nos enredabamos porque los clientes daban direcciones incompletas. Ahora todo llega organizado y el domiciliario va directo con el GPS.' },
                { name: 'Mauricio Henao', biz: 'Pizzeria Napolitana · Medellin', initials: 'MH', color: 'bg-blue-600', quote: 'Muchos clientes nos piden para pasar a recoger. El pedido ya esta listo cuando llegan y nos pagan directo al Nequi sin pagarle porcentajes a nadie.' },
              ].map((t, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} text-white text-xs font-black flex items-center justify-center shrink-0`}>{t.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.biz}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="currentColor" className="text-orange-400" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="preguntas" className="py-14 sm:py-16 bg-gray-50/80 border-b border-gray-100">
        <div className="fluid-container max-w-3xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Preguntas frecuentes</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Dudas antes de empezar</h2>
          </div>
          <div className="space-y-0 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {FAQS.map((faq, idx) => (
              <div key={idx}>
                <button onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)} className="w-full px-5 sm:px-6 py-4 text-left text-sm font-bold text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-orange-600' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${openFaq === idx ? 'max-h-40' : 'max-h-0'}`}>
                  <div className="px-5 sm:px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-16 sm:py-20 bg-gray-950 text-white relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="fluid-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-600/15 border border-orange-500/25 text-orange-400 text-xs font-bold">
                <Sparkles size={12} /><span>Unete a los negocios que ya venden con Camly</span>
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">Empieza a vender hoy.<br /><span className="text-orange-500">Sin enredos.</span></h2>
              <p className="text-base text-gray-400 max-w-md">En 5 minutos tienes tu catalogo online con GPS, recogida en tienda y pagos directos a tu cuenta funcionando.</p>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link to="/registro" className="btn-primary py-3.5 px-7 text-sm font-bold shadow-xl gap-2 hover:scale-[1.02] transition-transform"><span>Crear mi tienda en 5 minutos</span><ArrowRight size={15} /></Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pt-1">
                  <CheckCircle2 size={14} className="text-emerald-500" /><span>7 dias gratis · Sin tarjeta</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating card 1 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-2.5 w-64">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">WA</div>
                    <span className="text-xs font-bold text-white/80">3 pedidos nuevos</span>
                  </div>
                  <div className="space-y-1.5">
                    {['#1041 · Hamburguesa Doble + Papas', '#1042 · Pizza Familiar Hawaiana', '#1043 · 3x Malteada Oreo'].map((o, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" /><span>{o}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">Hace 2 minutos</span>
                    <span className="text-xs font-black text-white">$127.000</span>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-3 -left-4 bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <DollarSign size={12} /><span>$0 comisiones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="py-8 bg-black text-gray-400 text-sm border-t border-gray-900">
        <div className="fluid-container flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5"><SaaSLogo className="h-6 text-white" /><span className="text-gray-500">Catalogos digitales para WhatsApp sin comisiones</span></div>
          <div className="flex items-center gap-5 font-semibold">
            <Link to="/login"    className="hover:text-white transition-colors">Iniciar sesion</Link>
            <Link to="/registro" className="hover:text-white transition-colors">Crear tienda</Link>
            <Link to="/tracking" className="hover:text-white transition-colors">Rastreo de pedido</Link>
          </div>
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} CAMLY. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
