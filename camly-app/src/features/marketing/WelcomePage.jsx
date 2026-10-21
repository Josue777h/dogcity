import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
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
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 text-slate-950">
      <SEO
        title="Tu tienda está lista | NEGU"
        description="Continúa en el panel para configurar tu tienda en NEGU."
        canonical="https://negu.pro/bienvenido"
      />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center">
        <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-8" /></Link>
      </header>

      <section className="flex flex-1 items-center justify-center py-8">
        <div className="animate-fade-in-up w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="success-mark-pop relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            {!loadingBusiness && <div aria-hidden="true" className="success-confetti">
              <span style={{ '--confetti-x': '-25px', '--confetti-y': '-28px', '--confetti-rotate': '-35deg' }} />
              <span style={{ '--confetti-x': '2px', '--confetti-y': '-37px', '--confetti-rotate': '20deg' }} />
              <span style={{ '--confetti-x': '29px', '--confetti-y': '-25px', '--confetti-rotate': '55deg' }} />
              <span style={{ '--confetti-x': '-33px', '--confetti-y': '3px', '--confetti-rotate': '28deg' }} />
              <span style={{ '--confetti-x': '34px', '--confetti-y': '6px', '--confetti-rotate': '-25deg' }} />
              <span style={{ '--confetti-x': '-22px', '--confetti-y': '28px', '--confetti-rotate': '62deg' }} />
              <span style={{ '--confetti-x': '22px', '--confetti-y': '30px', '--confetti-rotate': '-55deg' }} />
            </div>}
            {loadingBusiness ? <LoaderCircle size={21} className="animate-spin" /> : <Check size={21} strokeWidth={2.5} />}
          </div>
          <p className="mt-5 text-sm font-semibold text-emerald-800">{loadingBusiness ? 'Un momento' : '¡Felicitaciones!'}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {loadingBusiness ? 'Cargando tu tienda…' : `${businessName} ya está en NEGU`}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tu negocio ya está creado. Entra al panel para agregar tu primer producto y dejar todo listo.
          </p>

          <Link to="/admin" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
            Ir al panel <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
