import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { completePendingBusinessRegistration, getSupabase } from '../../lib/supabase';
import { useAuthStore, useBusinessStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';

let verificationPromise = null;

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);
  const setBusiness = useBusinessStore(state => state.setBusiness);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    if (!verificationPromise) {
      verificationPromise = (async () => {
        const supabase = getSupabase();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error('El enlace no inició una sesión. Solicita uno nuevo e inténtalo otra vez.');

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!(user?.email_confirmed_at || user?.confirmed_at)) {
          throw new Error('El correo aún no aparece confirmado. Abre el enlace más reciente que te enviamos.');
        }

        const verifiedSession = { ...session, user };
        const business = await completePendingBusinessRegistration(verifiedSession);
        return { verifiedSession, business };
      })().finally(() => { verificationPromise = null; });
    }

    verificationPromise
      .then(({ verifiedSession, business }) => {
        if (!active) return;
        setSession(verifiedSession);
        setBusiness(business);
        navigate('/bienvenido', { replace: true });
      })
      .catch(callbackError => {
        if (active) setError(callbackError.message || 'No pudimos completar la verificación. Solicita un enlace nuevo.');
      });
    return () => { active = false; };
  }, [attempt, navigate, setBusiness, setSession]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 text-slate-950">
      <SEO title="Verificando correo | NEGU" description="Estamos confirmando tu correo y preparando tu cuenta de NEGU." canonical="https://negu.pro/auth/callback" noindex />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center"><Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-8" /></Link></header>
      <section className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error ? <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700"><AlertCircle size={22} /></div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">No pudimos terminar</h1>
            <p role="alert" className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
            <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Intentar de nuevo</button>
            <Link to="/verificar-correo" className="mt-3 inline-flex min-h-10 w-full items-center justify-center text-sm font-medium text-slate-600">Solicitar otro enlace</Link>
          </> : <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800"><Loader2 size={22} className="animate-spin" /></div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">Verificando tu correo</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Estamos activando tu cuenta y preparando el acceso al panel. Esto puede tardar unos segundos.</p>
          </>}
        </div>
      </section>
      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
