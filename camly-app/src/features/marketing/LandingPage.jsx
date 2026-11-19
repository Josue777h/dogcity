import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Smartphone, CheckCircle2,
  Check, ArrowRight, ChevronDown,
  ShoppingBag, DollarSign, Store,
  Pizza, Coffee, Cake, Fish, Beef,
  Navigation, Play, Layers, QrCode, Truck
} from 'lucide-react';
import storePreview from '../../assets/ejemplo.jpeg';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

const BUSINESS_TYPES = [
  { icon: ShoppingBag, label: 'Comidas Rápidas' },
  { icon: Beef,        label: 'Restaurantes y Parrilla' },
  { icon: Pizza,       label: 'Pizzerías' },
  { icon: Coffee,      label: 'Cafeterías y Panaderías' },
  { icon: Fish,        label: 'Sushi y Wok' },
  { icon: Cake,        label: 'Postres y Heladerías' },
];

const STEPS = [
  {
    n: 'Paso 1',
    icon: Smartphone,
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
    title: 'Sube tus productos',
    text: 'Agrega categorías, fotografías, precios y opciones o adicionales desde tu celular o computador.',
  },
  {
    n: 'Paso 2',
    icon: MessageCircle,
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    title: 'Comparte tu enlace o QR',
    text: 'Pon tu link en Instagram, WhatsApp o imprime los códigos QR para las mesas de tu local.',
  },
  {
    n: 'Paso 3',
    icon: CheckCircle2,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Recibe pedidos listos',
    text: 'La orden llega estructurada al panel y a tu WhatsApp con total exacto, forma de pago y ruta GPS.',
  },
];

const CORE_FEATURES = [
  {
    icon: Layers,
    tone: 'bg-sky-50 text-sky-700',
    title: 'Opciones, adicionales y notas de cocina',
    description: 'Configura proteínas, tamaños, salsas o ingredientes a retirar con cálculo automático de precio en cada pedido.',
  },
  {
    icon: Navigation,
    tone: 'bg-sky-50 text-sky-700',
    title: 'Cálculo de domicilio por GPS o tarifa fija',
    description: 'El cliente marca su pin en el mapa o escribe su dirección; tu repartidor recibe el enlace directo a Google Maps o Waze.',
  },
  {
    icon: QrCode,
    tone: 'bg-slate-100 text-slate-800',
    title: 'Comandero de mesas, QR e impresión térmica',
    description: 'Toma pedidos por mesa en el salón, activa el modo mesero con PIN e imprime comandas por Bluetooth en tu cocina.',
  },
  {
    icon: DollarSign,
    tone: 'bg-emerald-50 text-emerald-700',
    title: '0% comisión y seguimiento en vivo',
    description: 'El cliente paga directo a tu Nequi, Daviplata o en efectivo, sube el comprobante y consulta el estado de su pedido en tiempo real.',
  },
];

const SELLING_MODES = [
  {
    icon: Truck,
    title: 'A domicilio',
    tag: 'Cobertura y rutas',
    description: 'Configura tarifa fija, por kilómetro según GPS o cotización manual, y envía el pedido completo al WhatsApp de tu repartidor.',
  },
  {
    icon: Store,
    title: 'Para recoger en local',
    tag: 'Sin costo de envío',
    description: 'Tus clientes piden por adelantado desde el catálogo y reciben aviso automático en el seguimiento cuando su orden está lista.',
  },
  {
    icon: QrCode,
    title: 'En mesa con código QR',
    tag: 'Atención en salón',
    description: 'El comensal escanea el QR de su mesa para ver la carta actualizada, hacer pedidos o solicitar al mesero desde su teléfono.',
  },
];

const FAQS = [
  {
    q: '¿Mis clientes tienen que descargar alguna aplicación?',
    a: 'No. NEGU funciona directamente en el navegador web de cualquier teléfono móvil (Android o iPhone). Tu cliente abre tu enlace o escanea tu QR, arma su carrito y envía su pedido sin instalar nada.',
  },
  {
    q: '¿Cómo funciona la ubicación GPS para los domiciliarios?',
    a: 'Cuando el cliente selecciona servicio a domicilio, puede usar su GPS o ubicar su pin en el mapa. En el pedido y en el mensaje de WhatsApp llega el enlace directo para abrir Google Maps o Waze sin perder tiempo.',
  },
  {
    q: '¿Cómo recibo el dinero de mis ventas?',
    a: 'El 100% de tu dinero entra directamente a tus cuentas (Nequi, Daviplata, banco o efectivo contraentrega). NEGU nunca retiene tu dinero ni cobra porcentajes por pedido.',
  },
  {
    q: '¿Puedo actualizar precios o pausar productos en tiempo real?',
    a: 'Sí. Desde el panel administrativo cambias precios, agregas opciones, subes fotos o pausas productos agotados al instante desde tu celular o computador.',
  },
  {
    q: '¿Qué necesito para empezar los 7 días de prueba gratis?',
    a: 'Solo el nombre de tu negocio, tu número de WhatsApp y tu correo electrónico. No solicitamos tarjeta de crédito ni cláusulas de permanencia.',
  },
  {
    q: '¿Qué pasa si un cliente prefiere recoger en el local?',
    a: 'El cliente selecciona "Recoger en tienda" con envío en $0 y el pedido entra a tu panel identificado para retiro en local, evitando filas y confusiones.',
  },
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
      <section className="bg-slate-950 text-white border-b border-slate-900">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-16 lg:pb-20">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 py-1.5 px-3.5 text-xs font-semibold text-slate-200 lg:mx-0">
              <span className="text-sky-400 font-bold">GPS &amp; WhatsApp</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span>Catálogo digital listo en minutos</span>
            </div>

            <h1 className="font-display text-[2.45rem] leading-[1.06] font-extrabold tracking-tight sm:text-5xl lg:text-[3.75rem]">
              Tu catálogo digital,{' '}
              <span className="text-sky-400">listo en minutos</span>
              <span className="mt-2 block text-2xl font-bold tracking-tight text-slate-300 sm:text-3xl lg:text-[2.25rem]">
                conectado a WhatsApp.
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
              Tus clientes arman su pedido con opciones y lo envían a tu WhatsApp con{' '}
              <strong className="font-semibold text-white">ubicación GPS exacta</strong> para domicilio o recogida en tienda. Sin programar y con 0% de comisiones.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row lg:justify-start">
              <Link
                to="/registro"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] px-6 py-3.5 text-sm font-bold text-white transition-colors sm:w-auto sm:text-base"
              >
                <span>Crear mi tienda gratis</span>
                <ArrowRight size={17} />
              </Link>

              <a
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-sm font-bold text-white transition-colors sm:w-auto sm:text-base"
              >
                <Play size={15} className="fill-white" />
                <span>Ver cómo funciona</span>
              </a>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-slate-300 sm:text-sm lg:justify-start">
              {['7 días gratis sin tarjeta', '0% comisiones por venta', 'Ruta GPS para Maps y Waze'].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-sky-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Device showcase (unobstructed screen + status strip below) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[290px] sm:max-w-[320px]">
              <div className="rounded-[2.4rem] border border-slate-800 bg-slate-900 p-2.5 shadow-2xl">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[1.95rem] bg-white">
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

              <div className="mt-3 grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <MessageCircle size={14} />
                  </span>
                  <span className="font-medium text-slate-200 leading-snug">Pedido #1048 a WhatsApp · $42.000</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                    <Navigation size={14} />
                  </span>
                  <span className="font-medium text-slate-200 leading-snug">Ruta GPS lista para Maps y Waze</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CREADO PARA (STATIC BAR) ═══════════ */}
      <div className="border-b border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">
            Ideal para negocios gastronómicos
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {BUSINESS_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 sm:text-sm"
                >
                  <Icon size={14} className="shrink-0 text-sky-700" />
                  <span>{item.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════ TOOLS: STORE LINK + SAVINGS ═══════════ */}
      <section className="bg-slate-50 py-14 sm:py-16 border-b border-slate-200">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Tu enlace de tienda</span>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-950">Prepara el enlace de tu negocio</h2>
            <p className="mt-1.5 text-sm text-slate-600">Define cómo encontrarán tu catálogo tus clientes.</p>

            <label htmlFor="store-slug" className="sr-only">Nombre de tu tienda</label>
            <div className="mt-5 flex overflow-hidden rounded-xl border border-slate-300 bg-white transition-shadow focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-500">negu.pro/</span>
              <input
                id="store-slug"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="mi-negocio"
                className="min-w-0 flex-1 px-3.5 py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Vista previa: <span className="font-mono font-semibold text-slate-800">negu.pro/{storeSlug || 'mi-negocio'}</span>
            </p>

            <Link to={registrationUrl} className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] px-5 py-3 text-sm font-bold text-white transition-colors">
              Continuar gratis <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Calculadora de ahorro</span>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-950">Vende sin pagar comisión por pedido</h2>

            <div className="mt-5 flex items-end justify-between gap-3">
              <label htmlFor="sales-value" className="text-sm text-slate-600">Ventas mensuales aproximadas</label>
              <span className="font-display text-lg font-bold tabular-nums text-slate-900">${monthlySales.toLocaleString('es-CO')}</span>
            </div>
            <input
              id="sales-value"
              type="range"
              min="500000"
              max="30000000"
              step="250000"
              value={monthlySales}
              onChange={e => setMonthlySales(Number(e.target.value))}
              className="mt-3 w-full accent-[#0284C7]"
            />

            <div className="mt-5 rounded-xl border border-emerald-200/80 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-900">
              Con una comisión de referencia del 5%, ahorrarías{' '}
              <strong className="font-bold">${Math.round(monthlySales * 0.05).toLocaleString('es-CO')}</strong> al mes con 0% de comisión de NEGU.
            </div>
            <p className="mt-auto pt-3 text-xs text-slate-500">Estimación ilustrativa usando una comisión de referencia del 5%.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ CÓMO FUNCIONA ═══════════ */}
      <section id="como-funciona" className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10 sm:mb-12 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Flujo operativo</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Así de simple es vender con NEGU
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tus clientes piden desde su celular en segundos y tú recibes la comanda completa en tu panel y WhatsApp.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map(step => {
              const Icon = step.icon;
              return (
                <li key={step.n} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${step.tone}`}>
                      <Icon size={19} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{step.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ═══════════ 2x2 FEATURE GRID ═══════════ */}
      <section id="solucion" className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10 sm:mb-12 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Herramientas del negocio</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Todo lo que necesitas para operar sin intermediarios
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Controla tu catálogo, comandas y domicilios desde un mismo panel, sin pagar porcentajes por pedido.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {CORE_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <article key={feat.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feat.tone}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-950">{feat.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{feat.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ TRES MODALIDADES DE VENTA ═══════════ */}
      <section id="comparativa" className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10 sm:mb-12 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Canales integrados</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Tres modalidades de venta en un mismo panel
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Atiende domicilios, pedidos para recoger y mesas del restaurante desde el mismo catálogo digital.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SELLING_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <div key={mode.title} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Icon size={19} />
                    </div>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {mode.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-950">{mode.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{mode.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ PRECIOS ═══════════ */}
      <section id="precios" className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Precios claros</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Sin comisiones sorpresa. Paga mes a mes.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Comienza hoy con 7 días de prueba completa. Cancela cuando quieras sin compromisos.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
            {/* Prueba */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-950">Prueba Gratuita</h3>
                <p className="mt-1 text-sm text-slate-600">Conoce el sistema y pon tu tienda en línea</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-950">$0</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">/ 7 días</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                {['Catálogo interactivo completo', 'Recepción de pedidos a WhatsApp', 'Cálculo GPS por kilómetro', 'Sin tarjeta de crédito requerida'].map(t => (
                  <li key={t} className="flex items-center gap-3">
                    <Check size={16} className="shrink-0 text-sky-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/registro" className="mt-8 block w-full rounded-xl border border-slate-300 bg-white py-3.5 text-center text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50">
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Pro */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#0284C7] bg-white p-6 sm:p-8 shadow-sm">
              <span className="absolute -top-3.5 right-6 rounded-full bg-[#0284C7] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Recomendado
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-slate-950">Plan Profesional</h3>
                <p className="mt-1 text-sm font-semibold text-sky-700">Todo ilimitado para negocios en crecimiento</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-950 tabular-nums">
                  $60.000
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">COP / mes</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-6 text-sm font-medium text-slate-800">
                {[
                  'Productos, categorías y opciones ilimitadas',
                  'Cálculo automático de domicilio GPS y seguimiento',
                  'Comandero de mesas, QR e impresión Bluetooth',
                  'Gestión de repartidores y reportes en CSV',
                  'Soporte prioritario por WhatsApp',
                ].map(t => (
                  <li key={t} className="flex items-center gap-3">
                    <Check size={16} className="shrink-0 text-sky-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/registro" className="mt-8 block w-full rounded-xl bg-[#0284C7] hover:bg-[#0369A1] py-3.5 text-center text-sm font-bold text-white transition-colors">
                Activar con 7 días gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 space-y-2 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Dudas frecuentes</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-slate-950">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-200 ${isOpen ? 'border-sky-200' : 'border-slate-200'}`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${idx}`}
                      id={`faq-button-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left text-sm sm:text-base font-bold text-slate-900 transition-colors hover:bg-slate-50 cursor-pointer"
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
      <section className="bg-slate-950 py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-4xl space-y-6 px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight">
            Empieza a vender hoy.<br />
            <span className="text-sky-400">Tu catálogo conectado a WhatsApp.</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
            En pocos minutos tienes tu catálogo en línea con opciones por producto, GPS, recogida en local y comandas organizadas.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <Link
              to="/registro"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] px-7 py-3.5 text-sm font-bold text-white transition-colors sm:w-auto sm:text-base"
            >
              <span>Crear mi tienda gratis</span>
              <ArrowRight size={17} />
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
