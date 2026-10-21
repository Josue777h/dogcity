import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, LoaderCircle, Store } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { useAuthStore, useBusinessStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';

export default function WelcomePage() {
  const business = useBusinessStore(state => state.business);
  const setBusiness = useBusinessStore(state => state.setBusiness);
  const session = useAuthStore(state => state.session);
  const addToast = useToastStore(state => state.addToast);
  const [lookupDone, setLookupDone] = useState(false);
  const loadingBusiness = !business && Boolean(session?.user?.id) && !lookupDone;

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
        setLookupDone(true);
      })
      .catch(() => {
        if (!active) return;
        addToast('No pudimos cargar los datos de tu negocio.', 'error');
        setLookupDone(true);
      });

    return () => { active = false; };
  }, [business, session?.user?.id, setBusiness, addToast]);

  const businessName = business?.nombre_visible || business?.nombre || 'tu negocio';

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_#e0f2fe_0%,_#f8fafc_44%,_#f8fafc_100%)] px-4 text-slate-950">
      <SEO
        title="Tu tienda está lista | NEGU"
        description="Continúa en el panel para configurar tu tienda en NEGU."
        canonical="https://negu.pro/bienvenido"
      />
      <header className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center gap-3">
        <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-11 sm:h-12" /></Link>
        <span className="h-8 w-px bg-slate-300" aria-hidden="true" />
        <p className="max-w-[190px] text-xs font-medium leading-4 text-slate-600 sm:max-w-none sm:text-sm">Herramientas para negocios locales</p>
      </header>

      <section className="flex flex-1 items-center justify-center py-5 sm:py-8">
        <div className="animate-fade-in-up w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-36px_rgba(15,23,42,0.35)]">
          <div className="h-1.5 bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-400" />
          <div className="p-5 sm:p-8">
          <div className="flex items-start gap-4 sm:gap-5">
          <div className="success-mark-pop relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 sm:h-16 sm:w-16">
            {!loadingBusiness && <div aria-hidden="true" className="success-confetti">
              <span style={{ '--confetti-x': '-25px', '--confetti-y': '-28px', '--confetti-rotate': '-35deg' }} />
              <span style={{ '--confetti-x': '2px', '--confetti-y': '-37px', '--confetti-rotate': '20deg' }} />
              <span style={{ '--confetti-x': '29px', '--confetti-y': '-25px', '--confetti-rotate': '55deg' }} />
              <span style={{ '--confetti-x': '-33px', '--confetti-y': '3px', '--confetti-rotate': '28deg' }} />
              <span style={{ '--confetti-x': '34px', '--confetti-y': '6px', '--confetti-rotate': '-25deg' }} />
              <span style={{ '--confetti-x': '-22px', '--confetti-y': '28px', '--confetti-rotate': '62deg' }} />
              <span style={{ '--confetti-x': '22px', '--confetti-y': '30px', '--confetti-rotate': '-55deg' }} />
            </div>}
            {loadingBusiness ? <LoaderCircle size={25} className="animate-spin" /> : <Check size={26} strokeWidth={2.5} />}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-emerald-800">{loadingBusiness ? 'Preparando tu espacio' : '¡Felicitaciones!'}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {loadingBusiness ? 'Cargando los datos de tu negocio…' : `${businessName} ya está en NEGU`}
            </h1>
          </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:ml-[4.75rem]">
            {loadingBusiness
              ? 'Estamos preparando el panel para que continúes con la configuración.'
              : 'Tu negocio ya está creado. Entra al panel para agregar tu primer producto y dejar todo listo.'}
          </p>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:ml-[4.75rem]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><Store size={18} /></div>
            <p className="text-xs leading-5 text-slate-600">{loadingBusiness ? 'Consultando tu tienda' : businessName}<span className="block font-medium text-slate-800">{loadingBusiness ? 'Un momento, ya casi está listo' : 'Tu negocio quedó creado correctamente'}</span></p>
          </div>

          <Link to="/admin" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:ml-[4.75rem] sm:w-[calc(100%-4.75rem)]">
            Ir al panel <ArrowRight size={17} />
          </Link>
          </div>
        </div>
      </section>
      <footer className="mx-auto w-full max-w-6xl py-3 text-center text-xs text-slate-400">NEGU</footer>
    </main>
  );
}
