import { createElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, CheckCircle2, Copy, ExternalLink, LoaderCircle,
  PackagePlus, Palette, Store, Truck, WandSparkles
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuthStore, useBusinessStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';

const setupSteps = [
  {
    title: 'Agrega tus productos',
    description: 'Incluye nombres, precios y fotos para que tu catálogo esté listo para vender.',
    href: '/admin/productos',
    Icon: PackagePlus,
    action: 'Crear productos',
  },
  {
    title: 'Dale identidad a tu tienda',
    description: 'Ajusta el logo, los colores, el horario y los datos de contacto.',
    href: '/admin/configuracion',
    Icon: Palette,
    action: 'Personalizar tienda',
  },
  {
    title: 'Define cómo entregas',
    description: 'Configura recogida, domicilio, tarifas y medios de pago disponibles.',
    href: '/admin/configuracion',
    Icon: Truck,
    action: 'Configurar entregas',
  },
];

export default function WelcomePage() {
  const business = useBusinessStore(state => state.business);
  const setBusiness = useBusinessStore(state => state.setBusiness);
  const session = useAuthStore(state => state.session);
  const addToast = useToastStore(state => state.addToast);
  const [copied, setCopied] = useState(false);
  const [businessLookupDone, setBusinessLookupDone] = useState(false);
  const loadingBusiness = !business && Boolean(session?.user?.id) && !businessLookupDone;

  useEffect(() => {
    if (business || !session?.user?.id) return undefined;

    let active = true;
    getSupabase()
      .from('negocios')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) addToast('No pudimos cargar los datos de tu negocio.', 'error');
        if (data) setBusiness(data);
        setBusinessLookupDone(true);
      })
      .catch(() => {
        if (!active) return;
        addToast('No pudimos cargar los datos de tu negocio.', 'error');
        setBusinessLookupDone(true);
      });

    return () => { active = false; };
  }, [business, session?.user?.id, setBusiness, addToast]);

  const slug = business?.nombre;
  const businessName = business?.nombre_visible || business?.nombre || 'Tu negocio';
  const storeUrl = slug ? `${window.location.origin}/${slug}` : '';

  const handleCopy = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      addToast('Enlace copiado al portapapeles', 'success');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      addToast('No pudimos copiar el enlace. Selecciónalo y cópialo manualmente.', 'error');
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <SEO
        title="Tu tienda ya está creada | NEGU"
        description="Continúa la configuración de tu tienda en NEGU."
        canonical="https://negu.pro/bienvenido"
      />
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-7 sm:h-8" /></Link>
          <Link to="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Ir al panel <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,.85fr)] lg:gap-7">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,.04)]">
          <div className="relative overflow-hidden bg-slate-950 px-5 py-7 text-white sm:px-8 sm:py-9">
            <div aria-hidden="true" className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
            <div aria-hidden="true" className="absolute -bottom-36 right-20 h-64 w-64 rounded-full border-[35px] border-white/[.04]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <CheckCircle2 size={15} /> Negocio creado
              </div>
              <p className="mt-6 text-sm font-medium text-slate-300">Bienvenido a NEGU</p>
              <h1 className="mt-1 max-w-xl break-words text-3xl font-bold tracking-tight sm:text-4xl">
                {loadingBusiness ? 'Preparando tu tienda…' : `¡Listo, ${businessName}!`}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                Tu espacio ya está creado. Completa estos primeros detalles y podrás compartir tu catálogo con clientes.
              </p>

              {loadingBusiness ? (
                <div className="mt-7 flex items-center gap-2 text-sm text-slate-300"><LoaderCircle size={17} className="animate-spin" /> Cargando los datos de tu tienda</div>
              ) : storeUrl ? (
                <div className="mt-7 rounded-xl border border-white/10 bg-white/[.07] p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-200"><Store size={18} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Enlace de tu catálogo</p>
                        <a href={storeUrl} target="_blank" rel="noreferrer" className="mt-0.5 block truncate text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">{storeUrl}</a>
                      </div>
                    </div>
                    <button type="button" onClick={handleCopy} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-white px-3 text-xs font-bold text-slate-900 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar enlace'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-7 rounded-xl border border-amber-300/30 bg-amber-200/10 p-4 text-sm text-amber-100">
                  No encontramos el enlace de la tienda. Entra al panel para revisar los datos del negocio.
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link to="/admin" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
                  Abrir mi panel <ArrowRight size={16} />
                </Link>
                {storeUrl && (
                  <a href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
                    Ver catálogo <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><CheckCircle2 size={18} /></div>
              <div><h2 className="text-sm font-semibold">Sin comisión por pedido</h2><p className="mt-1 text-xs leading-5 text-slate-500">Tus ventas y pagos siguen bajo tu control.</p></div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><WandSparkles size={18} /></div>
              <div><h2 className="text-sm font-semibold">Empieza paso a paso</h2><p className="mt-1 text-xs leading-5 text-slate-500">Puedes ajustar cada detalle desde el panel.</p></div>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.04)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Siguiente paso</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Prepara tu catálogo</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">Tres ajustes para que tu tienda quede lista para recibir pedidos.</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">3 pasos</span>
          </div>

          <ol className="mt-5 divide-y divide-slate-100">
            {setupSteps.map((step, index) => (
              <li key={step.title} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="relative flex shrink-0 flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">{createElement(step.Icon, { size: 17 })}</span>
                    {index < setupSteps.length - 1 && <span aria-hidden="true" className="absolute top-10 h-8 w-px bg-slate-200" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
                    <Link to={step.href} className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-bold text-sky-800 hover:text-sky-950">
                      {step.action} <ArrowRight size={13} />
                    </Link>
                  </div>
                  <span className="pt-1 text-[11px] font-semibold tabular-nums text-slate-400">0{index + 1}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl bg-slate-50 p-3.5 text-xs leading-5 text-slate-600">
            <span className="font-semibold text-slate-800">¿Ya tienes todo configurado?</span> Abre tu catálogo, haz un pedido de prueba y luego comparte el enlace.
          </div>
        </aside>
      </div>
      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-[11px] text-slate-400 sm:px-6 sm:text-left">
        NEGU · Tu negocio, tus clientes, tu manera de vender.
      </footer>
    </main>
  );
}
