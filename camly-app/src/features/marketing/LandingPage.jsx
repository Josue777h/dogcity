import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Smartphone, CheckCircle2,
  Check, ArrowRight, X,
  ChevronDown,
  ShoppingBag, DollarSign,
  Store, Zap,
  Pizza, Coffee,
  Shirt, Cake, Fish, PawPrint, Beef, Navigation,
  Play
} from 'lucide-react';
import storePreview from '../../assets/ejemplo.jpeg';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import { SectionHeader } from './components/MarketingUI';

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

const STEPS = [
  {
    n: '01',
    icon: Smartphone,
    tone: 'bg-sky-100 text-sky-700',
    title: 'Sube tus productos',
    text: 'Agrega categorías, fotos, precios y opciones personalizadas en minutos desde tu celular o computador.',
  },
  {
    n: '02',
    icon: MessageCircle,
    tone: 'bg-indigo-100 text-indigo-700',
    title: 'Comparte tu enlace',
    text: 'Pon tu enlace en la biografía de Instagram, estados de WhatsApp o envíalo a quien te pregunte por el menú.',
  },
  {
    n: '03',
    icon: CheckCircle2,
    tone: 'bg-emerald-100 text-emerald-700',
    title: 'Recibe pedidos listos',
    text: 'El pedido llega a tu WhatsApp con productos, total exacto, método de pago y el enlace GPS para el repartidor.',
  },
];

const FAQS = [
  {
    q: '¿Mis clientes tienen que descargar alguna aplicación?',
    a: 'No. NEGU funciona directamente en el navegador web de cualquier teléfono móvil (Android o iPhone). Tu cliente abre tu enlace o escanea tu QR, arma su carrito y el pedido llega a tu WhatsApp con un solo clic.'
  },
  {
    q: '¿Cómo funciona la ubicación GPS para los domiciliarios?',
    a: 'Cuando el cliente selecciona servicio a domicilio, el catálogo interactivo detecta su ubicación GPS exacta y le permite ajustar su pin en el mapa. En el mensaje de WhatsApp que recibes viene el enlace directo que abre Google Maps o Waze en el celular de tu repartidor.'
  },
  {
    q: '¿Cómo recibo el dinero de mis ventas?',
    a: 'El 100% de tu dinero entra directamente a tus cuentas (Nequi, Daviplata, Bancolombia, Bre-B o efectivo contraentrega). NEGU nunca retiene tu dinero ni te cobra porcentajes por transacción.'
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
  const [openFaq, setOpenFaq] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [monthlySales, setMonthlySales] = useState(3000000);
  const storeSlug = storeName.trim().toLocaleLowerCase('es-CO').normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35);
  const registrationUrl = storeSlug ? `/registro?tienda=${encodeURIComponent(storeSlug)}` : '/registro';

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      <SEO
        title="NEGU | Software para Restaurantes y Negocios | Menú Digital & Pedidos WhatsApp"
        description="NEGU es la plataforma todo-en-uno para restaurantes y comercios: crea tu menú digital interactivo con código QR, recibe pedidos organizados a WhatsApp con cálculo GPS de envío y gestiona tus ventas sin comisiones. Empieza gratis."
        canonical="https://negu.pro/"
      />

      <MarketingNavbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Ambient glows */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-sky-600/25 blur-3xl" />
          <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-28">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3.5 text-xs font-semibold text-slate-200 backdrop-blur lg:mx-0">
              <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                GPS &amp; WhatsApp
              </span>
              <span>Tu catálogo digital listo en menos de 3 minutos</span>
            </div>

            <h1 className="font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Tu catálogo digital,{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-sky-500 bg-clip-text text-transparent">
                listo en minutos
              </span>
              <span className="mt-2 block text-2xl font-bold tracking-tight text-slate-300 sm:text-4xl lg:text-[2.6rem]">
                conectado a WhatsApp.
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
              Tus clientes arman su pedido interactivo y lo envían directo a tu WhatsApp con{' '}
              <strong className="font-semibold text-white">ubicación GPS exacta</strong> para el repartidor o recogida en tienda. Sin programar, sin contratos y con 0% de comisiones.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row lg:justify-start">
              <Link
                to="/registro"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_8px_30px_-6px_rgba(34,211,238,0.5)] transition-all duration-200 hover:bg-cyan-300 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto sm:text-base"
              >
                <span>Crear mi tienda gratis</span>
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>

              <a
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/10 sm:w-auto sm:text-base"
              >
                <Play size={15} className="fill-white" />
                <span>Ver cómo funciona</span>
              </a>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-3 text-xs font-semibold text-slate-300 sm:text-sm lg:justify-start">
              {['Sin tarjeta de crédito', '0% comisiones por venta', 'Ruta GPS para Maps y Waze'].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-cyan-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Device showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[300px] sm:max-w-[340px]">
              {/* Glow behind phone */}
              <div aria-hidden="true" className="absolute inset-x-8 top-10 bottom-10 rounded-[3rem] bg-sky-500/30 blur-2xl" />

              <div className="relative rounded-[2.6rem] border border-white/10 bg-slate-900 p-2.5 shadow-2xl ring-1 ring-white/10">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[2.1rem] bg-white">
                  <img
                    src={storePreview}
                    alt="Vista previa del catálogo NEGU en un celular"
                    width={390}
                    height={693}
                    className="h-full w-full object-cover object-top"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </div>

              {/* Floating: incoming WhatsApp order */}
              <div className="absolute -top-4 -left-2 sm:-left-8 z-20 flex max-w-[240px] items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <MessageCircle size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Nuevo pedido WhatsApp</p>
                  <p className="truncate text-xs font-extrabold text-slate-900">#1048 · 2x Burger Doble</p>
                  <p className="text-[10px] font-medium text-slate-500">Total: $42.000 · Pago confirmado</p>
                </div>
              </div>

              {/* Floating: GPS route */}
              <div className="absolute bottom-10 -right-2 sm:-right-8 z-20 flex max-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
                  <Navigation size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Ruta directa GPS</p>
                  <p className="truncate text-xs font-extrabold text-slate-900">Google Maps &amp; Waze</p>
                  <p className="text-[10px] font-medium text-slate-500">El repartidor va sin perderse</p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 left-6 z-20 flex items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-1.5 text-[11px] font-bold text-slate-950 shadow-lg">
                <DollarSign size={13} />
                <span>0% comisiones sobre tus ventas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CREATED FOR (TICKER) ═══════════ */}
      <div className="border-b border-slate-200 bg-white py-5 overflow-hidden">
        <div className="flex items-center">
          <div className="shrink-0 border-r border-slate-200 px-5 sm:px-8">
            <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Creado para
            </span>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex gap-3 pl-4" style={{ animation: 'marquee-slide 34s linear infinite', width: 'max-content' }}>
              {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span
                    key={i}
                    className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:text-sm"
                  >
                    <Icon size={15} className="shrink-0 text-sky-700" />
                    <span>{item.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLS: STORE LINK + SAVINGS ═══════════ */}
      <section className="bg-slate-50 py-14 sm:py-16 border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Tu enlace de tienda</span>
            <h2 className="mt-2 font-display text-xl font-extrabold text-slate-950">Prepara el enlace de tu negocio</h2>
            <p className="mt-1.5 text-sm text-slate-600">Define cómo encontrarán tu catálogo tus clientes.</p>

            <label htmlFor="store-slug" className="sr-only">Nombre de tu tienda</label>
            <div className="mt-5 flex overflow-hidden rounded-xl border border-slate-300 bg-white transition-shadow focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/15">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500">negu.pro/</span>
              <input
                id="store-slug"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="mi-negocio"
                className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <p className="mt-2 min-h-[1.25rem] text-xs text-slate-500">
              {storeName && <>Vista previa: <span className="font-semibold text-slate-800">negu.pro/{storeSlug || 'mi-tienda'}</span></>}
            </p>

            <Link to={registrationUrl} className="mt-auto inline-flex w-fit items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800">
              Continuar gratis <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Calculadora de ahorro</span>
            <h2 className="mt-2 font-display text-xl font-extrabold text-slate-950">Vende sin pagar comisión por pedido</h2>

            <div className="mt-5 flex items-end justify-between gap-3">
              <label htmlFor="sales-value" className="text-sm text-slate-600">Ventas mensuales aproximadas</label>
              <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">${monthlySales.toLocaleString('es-CO')}</span>
            </div>
            <input
              id="sales-value"
              type="range"
              min="500000"
              max="30000000"
              step="250000"
              value={monthlySales}
              onChange={e => setMonthlySales(Number(e.target.value))}
              className="mt-3 w-full accent-sky-700"
            />

            <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900">
              Con una comisión de referencia del 5%, ahorrarías{' '}
              <strong className="font-extrabold">${Math.round(monthlySales * 0.05).toLocaleString('es-CO')}</strong> al mes con 0% de comisión de NEGU.
            </div>
            <p className="mt-auto pt-3 text-[11px] text-slate-500">Estimación ilustrativa usando una comisión de referencia del 5%.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ CÓMO FUNCIONA ═══════════ */}
      <section id="como-funciona" className="bg-white py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader eyebrow={<><Zap size={13} className="text-sky-700" /> Flujo en 3 pasos</>} title="Así de simple es vender con NEGU">
            Tus clientes piden desde su celular en segundos y tú recibes la comanda completa en WhatsApp. Sin apps ni enredos.
          </SectionHeader>

          <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {/* Connector line (desktop) */}
            <div aria-hidden="true" className="absolute top-12 left-[16%] right-[16%] hidden h-px bg-gradient-to-r from-sky-200 via-indigo-200 to-emerald-200 md:block" />

            {STEPS.map(step => {
              const Icon = step.icon;
              return (
                <li key={step.n} className="group relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-900/5">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.tone}`}>
                      <Icon size={22} />
                    </div>
                    <span className="font-display text-3xl font-extrabold text-slate-200 transition-colors group-hover:text-sky-200">{step.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-lg sm:text-xl font-extrabold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ═══════════ BENTO: VENTAJAS ═══════════ */}
      <section id="solucion" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader eyebrow={<><CheckCircle2 size={13} /> Diseñado para dueños de negocios</>} tone="emerald" title="Todo lo que necesitas para vender más por WhatsApp">
            Herramientas precisas para organizar tus ventas sin pagar el 30% a plataformas intermediarias.
          </SectionHeader>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Large: GPS */}
            <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm md:col-span-8 md:row-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <Navigation size={22} />
              </div>
              <h3 className="mt-6 font-display text-xl sm:text-2xl font-extrabold text-slate-950">Cálculo de domicilio con pin GPS en el mapa</h3>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                Tu cliente marca su ubicación exacta en el mapa satelital. El sistema calcula la distancia por kilómetro desde tu local y envía la ruta directa para que tu repartidor abra Google Maps o Waze sin preguntar "¿por dónde queda tu casa?".
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                {['Ruta Waze & Maps', 'Cálculo exacto por KM', 'Cero llamadas de repartidores'].map(t => (
                  <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{t}</span>
                ))}
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-sky-100/70 blur-2xl" />
            </article>

            {/* Small: 0% */}
            <article className="flex flex-col rounded-2xl bg-slate-950 p-6 sm:p-8 text-white shadow-sm md:col-span-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <DollarSign size={22} />
              </div>
              <h3 className="mt-6 font-display text-xl font-extrabold">0% Comisiones</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Tus ventas son 100% tuyas. Los clientes pagan directo a tu cuenta de Nequi, Daviplata o en efectivo.
              </p>
              <p className="mt-auto pt-6 text-xs font-bold text-emerald-300">Conserva todo el margen de tus ventas.</p>
            </article>

            {/* Small: pickup */}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm md:col-span-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Store size={22} />
              </div>
              <h3 className="mt-6 font-display text-xl font-extrabold text-slate-950">Recogida en tienda</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Permite a tus clientes pedir con anticipación para recoger en el local sin hacer filas.
              </p>
            </article>

            {/* Large: live panel */}
            <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm md:col-span-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Smartphone size={22} />
              </div>
              <h3 className="mt-6 font-display text-xl sm:text-2xl font-extrabold text-slate-950">Control total desde tu celular en tiempo real</h3>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                Actualiza precios, sube fotos, oculta productos agotados y consulta el historial de ventas diarias sin depender de un programador o diseñador gráfico.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                {['Sin reimprimir cartas', 'Gestión de repartidores', 'Reportes de ingresos'].map(t => (
                  <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{t}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════ ANTES VS NEGU ═══════════ */}
      <section id="comparativa" className="bg-white py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader eyebrow="El antes y después" title="¿Por qué los negocios eligen NEGU?">
            Compara la diferencia entre atender por chat tradicional y contar con un catálogo automatizado.
          </SectionHeader>

          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
            {/* Antes */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-rose-700">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>El método tradicional (Caos)</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-700">
                {[
                  '10 a 15 mensajes repetitivos por cada cliente preguntando precios y sabores.',
                  'Direcciones incompletas que hacen que los domiciliarios se pierdan y tarden el doble.',
                  'Fotos borrosas enviadas por chat que saturan la memoria del teléfono.',
                  'Comisiones de hasta el 30% en apps de domicilios tradicionales.',
                ].map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <X size={18} className="mt-0.5 shrink-0 text-rose-600" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Con NEGU */}
            <div className="relative rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-50 to-white p-6 sm:p-8 shadow-xl shadow-sky-900/5">
              <span className="absolute -top-3.5 right-6 rounded-full bg-slate-950 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 shadow-sm">
                Con NEGU
              </span>
              <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-sky-800">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                <span>La experiencia NEGU</span>
              </div>
              <ul className="mt-6 space-y-4 text-sm font-medium text-slate-900">
                {[
                  'Un solo mensaje de WhatsApp con la comanda lista, precios sumados y método de pago.',
                  'Pin GPS exacto que abre Waze o Google Maps en 1 toque en el celular del repartidor.',
                  'Catálogo rápido, elegante y con fotos profesionales que abre sin descargar nada.',
                  '0% comisiones. El dinero entra completo y directo a tu Nequi, Daviplata o cuenta.',
                ].map(t => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sky-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRECIOS ═══════════ */}
      <section id="precios" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader eyebrow="Precios claros" title="Sin comisiones sorpresa. Paga mes a mes.">
            Comienza hoy con 7 días de prueba completa. Cancela cuando quieras sin compromisos.
          </SectionHeader>

          <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
            {/* Prueba */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div>
                <h3 className="font-display text-xl font-extrabold text-slate-950">Prueba Gratuita</h3>
                <p className="mt-1 text-sm text-slate-600">Conoce el sistema y pon tu tienda en línea</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-slate-950">$0</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">/ 7 días</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3.5 border-t border-slate-100 pt-6 text-sm text-slate-700">
                {['Catálogo interactivo completo', 'Recepción de pedidos a WhatsApp', 'Cálculo GPS por kilómetro', 'Sin tarjeta de crédito requerida'].map(t => (
                  <li key={t} className="flex items-center gap-3">
                    <Check size={17} className="shrink-0 text-sky-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/registro" className="mt-8 block w-full rounded-xl border border-slate-300 bg-white py-3.5 text-center text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50">
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative flex flex-col rounded-2xl border-2 border-sky-600 bg-white p-6 sm:p-8 shadow-xl shadow-sky-900/10">
              <span className="absolute -top-3.5 right-6 rounded-full bg-sky-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                Más popular
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold text-slate-950">Plan Profesional</h3>
                <p className="mt-1 text-sm font-semibold text-sky-700">Todo ilimitado para negocios en crecimiento</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-slate-950 tabular-nums">
                  $60.000
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">COP / mes</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3.5 border-t border-slate-100 pt-6 text-sm font-medium text-slate-800">
                {[
                  'Productos y categorías ilimitadas',
                  'Cálculo automático de domicilio GPS',
                  'Personalización con tu logo y colores',
                  'Asignación de repartidores en tiempo real',
                  'Soporte prioritario por WhatsApp',
                ].map(t => (
                  <li key={t} className="flex items-center gap-3">
                    <Check size={17} className="shrink-0 text-sky-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/registro" className="mt-8 block w-full rounded-xl bg-sky-700 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-sky-700/25 transition-all hover:bg-sky-800 hover:-translate-y-0.5">
                Activar con 7 días gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 space-y-3 text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">Respuestas rápidas</span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-200 ${isOpen ? 'border-sky-200 shadow-sm' : 'border-slate-200'}`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${idx}`}
                      id={`faq-button-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left text-sm sm:text-base font-bold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-700' : ''}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={`faq-panel-${idx}`} role="region" aria-labelledby={`faq-button-${idx}`} className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600 sm:px-6">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-sky-600/25 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-7 px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-cyan-200">
            <CheckCircle2 size={14} className="text-cyan-400" />
            <span>Únete a los negocios que ya venden con NEGU</span>
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight">
            Empieza a vender hoy.<br />
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">Tu catálogo conectado a WhatsApp.</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
            En menos de 3 minutos tienes tu catálogo en línea con GPS, recogida en local y pedidos organizados a tu WhatsApp.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <Link
              to="/registro"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-bold text-slate-950 shadow-[0_8px_30px_-6px_rgba(34,211,238,0.5)] transition-all duration-200 hover:bg-cyan-300 hover:-translate-y-0.5 sm:w-auto sm:text-base"
            >
              <span>Crear mi tienda en 3 minutos</span>
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs font-medium text-slate-400">
              7 días de prueba gratis · Sin tarjeta de crédito · Cancela en cualquier momento
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
