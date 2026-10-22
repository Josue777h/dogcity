import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getSupabase, updateAccountPassword } from '../../lib/supabase';
import { useAuthStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import PageLoading from '../../components/common/PageLoading';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RECOVERY_SESSION_KEY = 'negu_password_recovery_started_at';
const RECOVERY_SESSION_MAX_AGE = 60 * 60 * 1000;

function isRecentRecoverySession() {
  const startedAt = Number(sessionStorage.getItem(RECOVERY_SESSION_KEY));
  return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < RECOVERY_SESSION_MAX_AGE;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const existingReferrerMeta = document.querySelector('meta[name="referrer"]');
    const oldReferrerPolicy = existingReferrerMeta?.getAttribute('content');
    const referrerMeta = existingReferrerMeta || document.createElement('meta');
    referrerMeta.setAttribute('name', 'referrer');
    referrerMeta.setAttribute('content', 'no-referrer');
    if (!existingReferrerMeta) document.head.appendChild(referrerMeta);

    const cleanRecoveryFragment = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        sessionStorage.setItem(RECOVERY_SESSION_KEY, String(Date.now()));
        cleanRecoveryFragment();
        if (active) {
          setHasRecoverySession(true);
          setChecking(false);
        }
      }
    });

    const verifyRecoverySession = async () => {
      try {
        const { data: { session }, error: sessionError } = await getSupabase().auth.getSession();
        if (sessionError) throw sessionError;
        const hashType = new URLSearchParams(window.location.hash.slice(1)).get('type');
        const validRecovery = Boolean(session && (hashType === 'recovery' || isRecentRecoverySession()));
        if (validRecovery && hashType === 'recovery') {
          sessionStorage.setItem(RECOVERY_SESSION_KEY, String(Date.now()));
          cleanRecoveryFragment();
        }
        if (active) setHasRecoverySession(validRecovery);
      } catch {
        if (active) setHasRecoverySession(false);
      } finally {
        if (active) setChecking(false);
      }
    };

    verifyRecoverySession();
    return () => {
      active = false;
      subscription.unsubscribe();
      if (!existingReferrerMeta) referrerMeta.remove();
      else if (oldReferrerPolicy === null) referrerMeta.removeAttribute('content');
      else referrerMeta.setAttribute('content', oldReferrerPolicy);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const user = await updateAccountPassword(password);
      sessionStorage.removeItem(RECOVERY_SESSION_KEY);
      setSession(null);
      try { await getSupabase().auth.signOut(); } catch { /* La contraseña ya fue actualizada. */ }
      navigate('/login', { replace: true, state: { email: user?.email || '', passwordUpdated: true } });
    } catch (updateError) {
      const message = String(updateError?.message || '');
      const code = String(updateError?.code || '');
      if (code === 'same_password' || /different from the old password/i.test(message)) {
        setError('Esa es la misma contraseña que ya tienes. Escribe una diferente para continuar.');
      } else if (code === 'weak_password' || /password.*(weak|short|pwned|compromised|known)|weak password|at least|should contain/i.test(message)) {
        setError('Esa contraseña no es lo bastante segura. Usa al menos 8 caracteres e incluye mayúsculas, minúsculas y números.');
      } else if (/expired|invalid.*(token|jwt)|session.*(missing|not found|expired)|not authenticated/i.test(message)) {
        sessionStorage.removeItem(RECOVERY_SESSION_KEY);
        setHasRecoverySession(false);
        setError('El enlace venció o ya fue utilizado. Solicita uno nuevo para continuar.');
      } else {
        console.error('Error al actualizar contraseña:', updateError);
        setError('No pudimos actualizar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <PageLoading label="Validando enlace seguro" />;

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50 px-4 text-slate-950">
      <SEO title="Crear nueva contraseña | NEGU" description="Crea una nueva contraseña para recuperar el acceso a NEGU." canonical="https://negu.pro/restablecer-contrasena" noindex />
      <header className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center">
        <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-10" /></Link>
      </header>

      <section className="flex w-full min-w-0 flex-1 items-center justify-center py-8">
        <div className="w-full min-w-0 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${hasRecoverySession ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
            {hasRecoverySession ? <LockKeyhole size={22} /> : <ShieldCheck size={22} />}
          </div>

          {hasRecoverySession ? (
            <>
              <p className="mt-5 text-sm font-semibold text-slate-500">Recuperación de cuenta</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Crea una nueva contraseña</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Elige una contraseña nueva de al menos 8 caracteres. Después podrás iniciar sesión con ella.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="relative">
                  <Input
                    id="new-password"
                    label="Nueva contraseña"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={event => { setPassword(event.target.value); setError(''); }}
                    placeholder="Mínimo 8 caracteres"
                    className="min-h-11 pr-11"
                  />
                  <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-2.5 top-[34px] rounded p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    label="Confirma la nueva contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={event => { setConfirmPassword(event.target.value); setError(''); }}
                    placeholder="Escríbela de nuevo"
                    className="min-h-11 pr-11"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(value => !value)} className="absolute right-2.5 top-[34px] rounded p-1 text-slate-400 hover:text-slate-700" aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700">{error}</p>}
                <Button type="submit" fullWidth loading={loading} className="min-h-11">
                  {loading ? 'Actualizando contraseña…' : 'Guardar nueva contraseña'}
                </Button>
              </form>
            </>
          ) : (
            <div role="alert">
              <p className="mt-5 text-sm font-semibold text-slate-500">Enlace de recuperación</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">El enlace ya no es válido</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Puede haber vencido, ya se utilizó o se abrió incompleto. Solicita un enlace nuevo para proteger tu cuenta.</p>
              <Link to="/recuperar-contrasena" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-dark">Solicitar otro enlace</Link>
            </div>
          )}

          <Link to="/login" className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft size={15} />
            Volver a iniciar sesión
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
