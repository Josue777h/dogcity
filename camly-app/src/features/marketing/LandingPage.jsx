import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import storePreview from '../../assets/ejemplo.jpeg';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Carga tu carta o productos',
    text: 'Sube fotos desde tu teléfono (se optimizan automáticamente a WebP), organiza categorías y define opciones como tamaños, sabores o mitad y mitad.',
  },
  {
    num: '02',
    title: 'Comparte tu enlace o código QR',
    text: 'Publica tu link en WhatsApp, Instagram o imprime los códigos QR para las mesas de tu local.',
  },
  {
    num: '03',
    title: 'Recibe pedidos ordenados',
    text: 'Cada orden llega con el detalle de opciones, dirección en Google Maps, método de pago y panel de estado en tiempo real.',
  },
];

const CLIENT_BENEFITS = [
  'Abre directo en el navegador del celular sin instalar aplicaciones ni crear cuentas.',
  'Permite elegir tamaños, adicionales, sabores o combinaciones mitad y mitad con el precio claro.',
  'Calcula el envío por ubicación GPS, tarifa fija o cotización directa del local.',
  'Permite copiar el número de cuenta o llave Bre-B y enviar el comprobante por WhatsApp en un toque.',
];

const MERCHANT_BENEFITS = [
  '0% de comisiones por venta: todo el dinero entra directo a tus cuentas o en efectivo.',
  'Cambia precios, pausa productos agotados o actualiza horarios al instante desde tu teléfono.',
  'Cotiza envíos manuales desde el panel para que el cliente apruebe el total antes de transferir.',
  'Incluye modo Comandero por mesas, bloqueo por PIN para meseros e impresión térmica Bluetooth.',
];

const SELLING_MODES = [
  {
    label: 'Entrega',
    title: 'A domicilio',
    text: 'Cobra tarifa fija, cálculo automático por kilómetro en el mapa o cotización manual cuando prefieras confirmar primero el valor del envío.',
  },
  {
    label: 'Sin filas',
    title: 'Para recoger en tienda',
    text: 'Tu cliente elige sus productos desde el celular con envío en $0 y recibe aviso cuando su pedido está listo para pasar a recoger.',
  },
  {
    label: 'En salón',
    title: 'En mesa con código QR',
    text: 'Cada mesa tiene su QR para consultar la carta actualizada, avisar al mesero o registrar la comanda directamente hacia cocina.',
  },
];

const FAQS = [
  {
    q: '¿Mis clientes tienen que descargar alguna aplicación?',
    a: 'No. Tu catálogo funciona directo en el navegador del teléfono (Android o iPhone). Abren tu enlace o escanean el QR y hacen su pedido sin instalar nada.',
  },
  {
    q: '¿Cómo funcionan los productos con sabores mitad y mitad o adicionales?',
    a: 'Desde el editor de opciones puedes configurar grupos de selección única, límite de hasta 2 opciones (ideal para mitad y mitad), adicionales con precio extra o preferencias sin costo.',
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [storeName, setStoreName] = useState('');

  const storeSlug = storeName
    .trim()
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 35);

  const registrationUrl = storeSlug ? `/registro?tienda=${encodeURIComponent(storeSlug)}` : '/registro';

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      <SEO
        title="NEGU | Catálogo Digital y Pedidos por WhatsApp para Restaurantes y Negocios"
        description="Crea tu menú o catálogo digital interactivo, recibe pedidos organizados a WhatsApp con opciones, GPS o cotización de envío y administra tus mesas sin comisiones."
        canonical="https://negu.pro/"
      />

      <MarketingNavbar />

      {/* ═══════════ HERO EDITORIAL LIMPIO ═══════════ */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-16">
          <div className="space-y-5 lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Catálogo digital · WhatsApp · Salón QR
            </p>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl sm:leading-[1.08]">
              Tu menú o catálogo en línea, conectado directo a tu WhatsApp.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Tus clientes eligen productos, tamaños o sabores desde el celular y te envían el pedido ordenado con ubicación y forma de pago. Sin comisiones por venta.
            </p>

            {/* Creador de enlace integrado — 100% cómodo en móvil */}
            <div className="max-w-lg space-y-2.5 pt-1">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <label htmlFor="store-slug" className="sr-only">Nombre de tu negocio</label>
                <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-[#0284C7] focus-within:ring-2 focus-within:ring-[#0284C7]/20">
                  <span className="shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">
                    negu.pro/
                  </span>
                  <input
                    id="store-slug"
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="mi-negocio"
                    className="min-w-0 flex-1 px-3 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <Link
                  to={registrationUrl}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0369A1] sm:w-auto"
                >
                  <span>Crear tienda gratis</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>7 días gratis sin tarjeta</span>
                <span aria-hidden="true">·</span>
                <span>0% comisiones por pedido</span>
                <span aria-hidden="true">·</span>
                <a href="#como-funciona" className="font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950">
                  Ver cómo funciona
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-5">
            <div className="w-full max-w-[270px] sm:max-w-[300px]">
              <div className="rounded-[2.2rem] border border-slate-300 bg-slate-900 p-2.5 shadow-xl">
                <div className="aspect-[9/16] overflow-hidden rounded-[1.75rem] bg-white">
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
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TIPOS DE NEGOCIO ═══════════ */}
      <div className="border-b border-slate-200 bg-slate-50 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Funciona para distintos rubros
          </span>
          <div className="flex flex-wrap gap-2">
            {['Pizzerías', 'Restaurantes y Parrilla', 'Comidas rápidas', 'Cafeterías', 'Pastelerías', 'Comercios y retail'].map(label => (
              <span
                key={label}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ CÓMO FUNCIONA (BLOQUE ÚNICO 3 COLUMNAS) ═══════════ */}
      <section id="como-funciona" className="border-b border-slate-200 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 max-w-2xl space-y-2 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">En tres pasos</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Del menú en papel a pedidos claros en WhatsApp
            </h2>
          </div>

          <ol className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
            {WORKFLOW_STEPS.map(step => (
              <li key={step.num} className="p-6 sm:p-7">
                <span className="font-mono text-xs font-bold text-sky-700">{step.num}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════ DOS BLOQUES CLAROS: CLIENTE VS OPERACIÓN ═══════════ */}
      <section id="solucion" className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 max-w-2xl space-y-2 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Operación diaria</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Diseñado para que pedir y despachar sea rápido en celular
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
              <h3 className="font-display text-lg font-bold text-slate-950">Lo que ve tu cliente</h3>
              <p className="mt-1 text-sm text-slate-500">Catálogo directo, claro y rápido desde cualquier teléfono.</p>
              <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
                {CLIENT_BENEFITS.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-sky-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7">
              <h3 className="font-display text-lg font-bold text-slate-950">Lo que controlas en el panel</h3>
              <p className="mt-1 text-sm text-slate-500">Todo administrable desde el celular o la caja del negocio.</p>
              <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
                {MERCHANT_BENEFITS.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tres modalidades de venta */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {SELLING_MODES.map(mode => (
              <div key={mode.title} className="rounded-2xl border border-slate-200 border-t-2 border-t-[#0284C7] bg-white p-5 sm:p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{mode.label}</span>
                <h3 className="mt-1.5 font-display text-base font-bold text-slate-950">{mode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{mode.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRECIO ÚNICO Y DIRECTO ═══════════ */}
      <section id="precios" className="border-b border-slate-200 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-8 text-center space-y-2 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Plan único</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Una sola tarifa mensual, sin porcentajes por pedido
            </h2>
          </div>

          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-950">Plan Completo</h3>
                <p className="mt-1 text-sm text-slate-600">Incluye 7 días de prueba gratis sin tarjeta</p>
              </div>
              <div className="sm:text-right">
                <span className="font-display text-3xl font-extrabold tracking-tight text-slate-950 tabular-nums sm:text-4xl">
                  $60.000
                </span>
                <span className="ml-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">COP / mes</span>
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {[
                'Productos y categorías ilimitadas',
                'Pedidos directos por WhatsApp',
                'Envíos por GPS, fijo o por cotizar',
                'Comandero de mesas y códigos QR',
                'Impresión térmica Bluetooth POS',
                'Seguimiento en vivo y reportes',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-[#0284C7]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                to="/registro"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0369A1]"
              >
                <span>Empezar 7 días gratis</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/tracking?store=demo"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Ver seguimiento de ejemplo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PREGUNTAS FRECUENTES ═══════════ */}
      <section id="faq" className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-8 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Dudas frecuentes</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Preguntas habituales antes de empezar
            </h2>
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${idx}`}
                      id={`faq-button-${idx}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 transition-colors hover:bg-slate-50 sm:px-6 sm:text-base"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={`shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0284C7]' : ''}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={`faq-panel-${idx}`} role="region" aria-labelledby={`faq-button-${idx}`} className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-slate-600 sm:px-6">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CIERRE SIMPLE ═══════════ */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Pon tu menú o catálogo en línea hoy mismo
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Crea tu cuenta en pocos minutos y pruébalo con tu negocio real durante 7 días sin costo.
            </p>
          </div>

          <Link
            to="/registro"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0369A1] sm:w-auto"
          >
            <span>Crear mi tienda gratis</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
