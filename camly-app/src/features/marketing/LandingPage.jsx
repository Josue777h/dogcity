import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ChevronDown, MessageCircle, MapPin, QrCode, Printer, Wallet,
  Utensils, Sandwich, Coffee, CakeSlice, Store, Shirt, Flame,
  Camera, Share2, BellRing, Sparkles, SlidersHorizontal, ShoppingBag,
} from 'lucide-react';
import storePreview from '../../assets/ejemplo.jpeg';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';
import InteractiveHeroCanvas from './components/InteractiveHeroCanvas';
import { Reveal, CountUp } from './components/MarketingUI';
import { useInView } from './components/marketingMotion';

const WORKFLOW_STEPS = [
  {
    num: '01',
    icon: Camera,
    title: 'Carga tu catálogo o productos',
    text: 'Sube fotos desde tu teléfono (se optimizan solas), organiza categorías y define opciones como tallas, colores, sabores o adicionales.',
    tone: 'bg-sky-100 text-sky-700',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Comparte tu enlace o QR',
    text: 'Publica tu link en WhatsApp, Instagram o TikTok, o imprime códigos QR para tu local y mostrador.',
    tone: 'bg-amber-100 text-amber-700',
  },
  {
    num: '03',
    icon: BellRing,
    title: 'Recibe pedidos ordenados',
    text: 'Cada orden llega con variantes, dirección en Google Maps, método de pago y seguimiento en tiempo real.',
    tone: 'bg-emerald-100 text-emerald-700',
  },
];

const AUDIENCE = {
  cliente: {
    label: 'Tu cliente',
    title: 'Pedir es tan fácil como abrir un enlace',
    items: [
      'Abre directo en el navegador del celular, sin instalar apps ni crear cuentas.',
      'Elige tallas, variantes, sabores o adicionales con el precio siempre claro.',
      'El envío se calcula por GPS, tarifa fija o cotización directa del negocio.',
      'Copia el número de cuenta o llave Bre-B y envía el comprobante por WhatsApp en un toque.',
    ],
  },
  negocio: {
    label: 'Tu negocio',
    title: 'Controlas todo desde el celular',
    items: [
      '0% de comisiones por venta: el dinero entra directo a tus cuentas o en efectivo.',
      'Cambia precios, pausa productos agotados o actualiza horarios al instante.',
      'Cotiza envíos manuales para que el cliente apruebe el total antes de transferir.',
      'Panel de pedidos en vivo, códigos QR, comandero para locales e impresión térmica Bluetooth.',
    ],
  },
};

const BUSINESS_TYPES = [
  { label: 'Restaurantes y parrilla', icon: Flame },
  { label: 'Tiendas de ropa', icon: Shirt },
  { label: 'Comidas rápidas', icon: Sandwich },
  { label: 'Cafeterías', icon: Coffee },
  { label: 'Pastelerías y repostería', icon: CakeSlice },
  { label: 'Perfumería y belleza', icon: Sparkles },
  { label: 'Tiendas y regalos', icon: ShoppingBag },
  { label: 'Comercios y retail', icon: Store },
  { label: 'Gastronomía local', icon: Utensils },
];

const FAQS = [
  {
    q: '¿Mis clientes tienen que descargar alguna aplicación?',
    a: 'No. Tu catálogo funciona directo en el navegador del teléfono (Android o iPhone). Abren tu enlace o escanean el QR y hacen su pedido sin instalar nada.',
  },
  {
    q: '¿Cómo funcionan las variantes, tallas o adicionales en los productos?',
    a: 'Desde el editor de opciones puedes configurar grupos de selección única (como tallas, colores o presentaciones), selección múltiple con límite, adicionales con precio extra o preferencias sin costo.',
  },
  {
    q: '¿Cómo recibo el dinero de las ventas?',
    a: 'Directo en tus cuentas (Nequi, Daviplata, banco, llave Bre-B) o en efectivo contra entrega. NEGU no intermedia pagos ni cobra porcentajes por pedido.',
  },
  {
    q: '¿Qué pasa si mis envíos varían según el barrio o la distancia?',
    a: 'Puedes elegir entre tarifa fija, cálculo automático por distancia GPS o modo por cotizar: recibes el pedido, colocas el costo del domicilio y al cliente se le habilita confirmar y transferir.',
  },
  {
    q: '¿Qué necesito para probar los 7 días gratis?',
    a: 'Solo el nombre de tu negocio, tu WhatsApp y un correo electrónico. No pedimos tarjeta de crédito para iniciar.',
  },
];

const PLAN_FEATURES = [
  'Productos y categorías ilimitadas',
  'Pedidos directos por WhatsApp',
  'Envíos por GPS, fijo o por cotizar',
  'Códigos QR y comandero para locales',
  'Impresión térmica Bluetooth POS',
  'Seguimiento en vivo y reportes',
];

/** Conversación de WhatsApp que se "escribe" sola al entrar en pantalla. */
function ChatDemo() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const bubble = (delay, className, children) => (
    <div
      style={{ '--mk-delay': `${delay}ms` }}
      className={`${inView ? 'mk-pop' : 'opacity-0'} max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug shadow-sm ${className}`}
    >
      {children}
    </div>
  );
  return (
    <div ref={ref} className="space-y-2.5">
      {bubble(100, 'rounded-bl-md bg-white text-slate-800', <>Hola buenas tardes, ¿me pasas el catálogo?</>)}
      {bubble(850, 'ml-auto rounded-br-md bg-emerald-600 text-white', <>¡Hola! Claro, aquí puedes ver productos y pedir 👉 <span className="underline font-semibold">negu.pro/tienda</span></>)}
      {bubble(1700, 'rounded-bl-md bg-white text-slate-800', (
        <>
          <p className="font-bold text-slate-950">Pedido #1082 · Tienda Central</p>
          <p className="mt-0.5 text-slate-700">2 × Producto destacado — $48.000</p>
          <p className="text-slate-500 text-[12px]">◦ Presentación: Grande · Opción elegida</p>
          <p className="mt-1 text-[12px] font-medium text-emerald-700"><MapPin size={11} className="mr-1 inline" />Ubicación enviada · Transferencia</p>
        </>
      ))}
      {bubble(2600, 'ml-auto rounded-br-md bg-emerald-600 text-white', <>¡Recibido! Ya estamos preparando tu pedido ✅</>)}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [audience, setAudience] = useState('cliente');

  const activeAudience = AUDIENCE[audience];

  return (
    <div className="min-h-screen overflow-x-clip bg-white font-sans text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
      <SEO
        title="NEGU | Catálogo Digital y Pedidos por WhatsApp para Restaurantes y Negocios"
        description="Crea tu menú o catálogo digital interactivo, recibe pedidos organizados a WhatsApp con opciones, GPS o cotización de envío y administra tus mesas sin comisiones."
        canonical="https://negu.pro/"
      />

      <MarketingNavbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative isolate overflow-hidden bg-[#070B14] text-white">
        <InteractiveHeroCanvas />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#070B14] to-transparent" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-20">
          <div className="space-y-6 lg:col-span-7">
            <p className="mk-pop inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
              Catálogo digital y pedidos por WhatsApp
            </p>

            <h1 className="mk-title mk-pop text-[2.5rem] leading-[1.03] sm:text-6xl lg:text-[4.25rem] [--mk-delay:80ms]">
              Tu catálogo en línea,<br />
              <span className="text-sky-400">pedidos directo</span><br />
              a tu WhatsApp.
            </h1>

            <p className="mk-pop max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg [--mk-delay:160ms]">
              Tus clientes eligen productos, tallas, sabores o adicionales desde el celular, y tú recibes el pedido ordenado con ubicación y forma de pago. Sin comisiones por venta.
            </p>

            <div className="mk-pop space-y-3.5 pt-2 [--mk-delay:240ms]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/registro"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.98]"
                >
                  <span>Crear mi catálogo</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                >
                  Cómo funciona
                </a>
              </div>
              <p className="text-xs text-slate-400">
                Empiezas gratis por 7 días. Sin tarjeta ni comisiones por venta.
              </p>
            </div>
          </div>

          {/* Celular con tarjetas flotantes */}
          <div className="mk-pop relative flex justify-center lg:col-span-5 [--mk-delay:200ms]">
            <div className="mk-float-alt relative w-full max-w-[250px] sm:max-w-[290px]">
              <div className="rounded-[2.4rem] border border-white/15 bg-slate-900 p-2.5 shadow-2xl shadow-sky-900/50 ring-1 ring-white/10">
                <div className="aspect-[9/16] overflow-hidden rounded-[1.9rem] bg-white">
                  <img
                    src={storePreview}
                    alt="Vista previa real del catálogo NEGU en celular"
                    width={390}
                    height={693}
                    className="h-full w-full object-cover object-top"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              </div>

              <div className="mk-float absolute -left-6 top-10 flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 text-slate-900 shadow-xl shadow-slate-950/30 sm:-left-16">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white"><MessageCircle size={17} /></span>
                <div className="leading-tight">
                  <p className="text-xs font-extrabold">Nuevo pedido #1082</p>
                  <p className="text-[11px] text-slate-500">3 productos · $58.000</p>
                </div>
              </div>

              <div className="mk-float absolute -right-5 top-[44%] flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-slate-900 shadow-xl shadow-slate-950/30 [animation-delay:-2s] sm:-right-14">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><SlidersHorizontal size={16} /></span>
                <p className="text-[11px] font-bold leading-tight">Opciones y tallas<br />Precio al instante</p>
              </div>

              <div className="mk-float absolute -bottom-4 left-2 flex items-center gap-2 rounded-2xl bg-slate-950/90 px-3 py-2.5 text-white shadow-xl ring-1 ring-white/15 backdrop-blur [animation-delay:-4s] sm:-left-8">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-slate-950"><Check size={15} strokeWidth={3} /></span>
                <p className="text-xs font-bold">Pago confirmado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cifras */}
        <div className="border-t border-white/10 bg-white/[0.03]">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 text-center sm:px-6 md:grid-cols-4">
            {[
              { value: <CountUp to={0} suffix="%" />, label: 'comisiones por pedido' },
              { value: <CountUp to={3} suffix=" min" />, label: 'para publicar tu menú' },
              { value: <CountUp to={7} suffix=" días" />, label: 'de prueba gratis' },
              { value: <CountUp to={60} prefix="$" suffix=".000" />, label: 'COP al mes, plan único' },
            ].map(stat => (
              <div key={stat.label}>
                <dt className="mk-title text-3xl text-white sm:text-4xl">{stat.value}</dt>
                <dd className="mt-1 text-xs font-medium text-slate-400">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══════════ CINTA DE RUBROS ═══════════ */}
      <div className="mk-marquee overflow-hidden border-b border-slate-200 bg-white py-5" aria-label="Funciona para distintos rubros">
        <div className="mk-marquee-track">
          {[0, 1].map(copy => (
            <ul key={copy} className="flex shrink-0 items-center gap-3 pr-3" aria-hidden={copy === 1}>
              {BUSINESS_TYPES.map(({ label, icon }) => {
                const BizIcon = icon;
                return (
                  <li key={`${copy}-${label}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    <BizIcon size={16} className="text-sky-600" aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      </div>

      {/* ═══════════ CÓMO FUNCIONA ═══════════ */}
      <section id="como-funciona" className="relative bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl space-y-3 text-center sm:mb-16">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">En tres pasos</span>
            <h2 className="mk-title text-3xl text-slate-950 sm:text-5xl">Del menú en papel a pedidos claros en WhatsApp</h2>
          </Reveal>

          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {WORKFLOW_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <Reveal as="li" key={step.num} delay={idx * 120} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-2xl hover:shadow-sky-900/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${step.tone}`}>
                      <StepIcon size={26} />
                    </div>
                    <span className="mk-title select-none text-3xl leading-none tabular-nums text-slate-300 transition-colors duration-300 group-hover:text-sky-600">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="mk-title mt-6 text-xl text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ═══════════ BENTO: LO QUE INCLUYE ═══════════ */}
      <section id="solucion" className="relative bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl space-y-3 text-center sm:mb-14">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Todo en un solo lugar</span>
            <h2 className="mk-title text-3xl text-slate-950 sm:text-5xl">Hecho para vender más y despachar rápido</h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {/* WhatsApp */}
            <Reveal className="relative overflow-hidden rounded-3xl bg-[#0b1f2a] p-6 text-white md:col-span-4 md:row-span-2 sm:p-8">
              <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300"><MessageCircle size={13} /> WhatsApp</span>
                  <h3 className="mk-title text-2xl sm:text-3xl">Un solo mensaje con el pedido completo</h3>
                  <p className="text-sm leading-relaxed text-slate-300">Sin ir y venir preguntando precios. Llega con productos, opciones, dirección y forma de pago, listo para cocina.</p>
                </div>
                <div className="rounded-2xl bg-[#EFEAE2] p-3.5 shadow-2xl shadow-black/30">
                  <ChatDemo />
                </div>
              </div>
            </Reveal>

            {/* Opciones y variantes */}
            <Reveal delay={100} className="group relative overflow-hidden rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/10 md:col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/70 px-3 py-1 text-xs font-bold text-amber-900"><SlidersHorizontal size={13} /> Personalizable</span>
              <div className="my-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs ring-1 ring-amber-200/80 transition-transform duration-300 group-hover:-translate-y-0.5">Talla / Tamaño</span>
                <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-transform duration-300 group-hover:translate-y-0.5">Color / Sabor</span>
                <span className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-transform duration-300 group-hover:-translate-y-0.5">Adicional +$</span>
              </div>
              <h3 className="mk-title text-lg text-slate-950">Variantes y adicionales</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Configura tallas, colores, sabores o extras con precio automático y detalle exacto para tu equipo.</p>
            </Reveal>

            {/* QR / mesas */}
            <Reveal delay={200} className="group rounded-3xl bg-sky-50 p-6 ring-1 ring-sky-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-900/10 md:col-span-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><QrCode size={24} /></span>
              <h3 className="mk-title mt-5 text-lg text-slate-950">Mesas con código QR</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Cada mesa consulta la carta, llama al mesero o manda la comanda directo a cocina.</p>
            </Reveal>

            {/* Envíos */}
            <Reveal className="group rounded-3xl bg-white p-6 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5 md:col-span-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><MapPin size={24} /></span>
              <h3 className="mk-title mt-5 text-lg text-slate-950">Envíos a tu manera</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Tarifa fija, cálculo por kilómetro en el mapa o cotización manual antes de que el cliente pague.</p>
            </Reveal>

            {/* Pagos */}
            <Reveal delay={100} className="group rounded-3xl bg-emerald-50 p-6 ring-1 ring-emerald-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 md:col-span-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><Wallet size={24} /></span>
              <h3 className="mk-title mt-5 text-lg text-slate-950">Cobras sin intermediarios</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">Nequi, Daviplata, llave Bre-B o efectivo. El cliente copia la cuenta y te envía el comprobante.</p>
            </Reveal>

            {/* Impresión */}
            <Reveal delay={200} className="group rounded-3xl bg-slate-950 p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/30 md:col-span-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-cyan-300 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><Printer size={24} /></span>
              <h3 className="mk-title mt-5 text-lg">Comandero e impresión</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">Comandas por grupo de opciones, PIN para meseros e impresora térmica Bluetooth.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════ CLIENTE VS NEGOCIO (INTERACTIVO) ═══════════ */}
      <section className="relative bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl space-y-5 text-center">
            <h2 className="mk-title text-3xl text-slate-950 sm:text-5xl">Pensado para los dos lados del mostrador</h2>
            <div role="tablist" aria-label="Ver beneficios para" className="mx-auto inline-flex rounded-full bg-slate-100 p-1.5">
              {Object.entries(AUDIENCE).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={audience === key}
                  onClick={() => setAudience(key)}
                  className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${audience === key ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </Reveal>

          <div key={audience} role="tabpanel" className="mk-pop overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-xl shadow-sky-900/5 sm:p-10">
            <h3 className="mk-title text-2xl text-slate-950 sm:text-3xl">{activeAudience.title}</h3>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {activeAudience.items.map((item, idx) => (
                <li key={item} style={{ '--mk-delay': `${idx * 90}ms` }} className="mk-pop flex items-start gap-3 rounded-2xl bg-white p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={14} strokeWidth={3} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ PRECIO ═══════════ */}
      <section id="precios" className="relative isolate overflow-hidden bg-[#070B14] py-16 text-white sm:py-24">
        <InteractiveHeroCanvas />
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
            <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-sky-300">Plan único</span>
            <h2 className="mk-title text-3xl sm:text-5xl">Una sola tarifa, sin porcentajes por pedido</h2>
          </Reveal>

          <Reveal delay={100} className="mx-auto max-w-xl rounded-[2rem] bg-gradient-to-b from-white/15 to-white/[0.04] p-px">
            <div className="rounded-[calc(2rem-1px)] bg-slate-900/90 p-6 backdrop-blur sm:p-9">
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
                <div>
                  <h3 className="mk-title text-2xl">Plan Completo</h3>
                  <p className="mt-1 text-sm text-slate-400">Incluye 7 días de prueba gratis sin tarjeta</p>
                </div>
                <p className="sm:text-right">
                  <span className="mk-title text-4xl tabular-nums sm:text-5xl">$60.000</span>
                  <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">COP / mes</span>
                </p>
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-200 sm:grid-cols-2">
                {PLAN_FEATURES.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/20 text-sky-300"><Check size={12} strokeWidth={3} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/registro"
                  className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.98]"
                >
                  <span>Empezar 7 días gratis</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/tracking?store=demo"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Ver seguimiento de ejemplo
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ PREGUNTAS FRECUENTES ═══════════ */}
      <section id="faq" className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="mb-10 space-y-3 text-center">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">Dudas frecuentes</span>
            <h2 className="mk-title text-3xl text-slate-950 sm:text-5xl">Antes de empezar, lo que más nos preguntan</h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Reveal key={faq.q} delay={idx * 60} className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${isOpen ? 'border-sky-300 shadow-lg shadow-sky-900/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${idx}`}
                      id={`faq-button-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 sm:px-6 sm:text-base"
                    >
                      <span>{faq.q}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'rotate-180 bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronDown size={17} aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`faq-button-${idx}`}
                    aria-hidden={!isOpen}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 sm:px-6">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CIERRE ═══════════ */}
      <section className="relative isolate overflow-hidden bg-[#070B14] py-16 text-white sm:py-24">
        <InteractiveHeroCanvas />
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <h2 className="mk-title text-3xl sm:text-5xl">Pon tu menú en línea hoy mismo</h2>
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">Crea tu cuenta en pocos minutos y pruébalo con tu negocio real durante 7 días sin costo.</p>
          <Link
            to="/registro"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-slate-100 active:scale-[0.98] sm:w-auto sm:text-base"
          >
            <span>Crear mi catálogo</span>
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  );
}
