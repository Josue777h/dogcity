import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react';
import { completePendingBusinessRegistration, getSupabase, registerBusiness, resendSignupConfirmation } from '../../lib/supabase';
import { useAuthStore, useBusinessStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageLoading from '../../components/common/PageLoading';

const PENDING_REG_STORAGE_KEY = 'negu_pending_registration';

function readStoredPendingRegistration() {
  try {
    const raw = sessionStorage.getItem(PENDING_REG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredPendingRegistration(payload) {
  try {
    if (payload) {
      sessionStorage.setItem(PENDING_REG_STORAGE_KEY, JSON.stringify(payload));
    } else {
      sessionStorage.removeItem(PENDING_REG_STORAGE_KEY);
    }
  } catch {
    // ignore storage access issues
  }
}

export default function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore(state => state.setSession);
  const setBusiness = useBusinessStore(state => state.setBusiness);
  const addToast = useToastStore(state => state.addToast);

  const [savedRegistration, setSavedRegistration] = useState(() => (
    location.state?.registrationPayload || readStoredPendingRegistration()
  ));
  const [registeredEmail, setRegisteredEmail] = useState(() => (
    String(location.state?.email || location.state?.registrationPayload?.email || readStoredPendingRegistration()?.email || '').trim()
  ));
  const [email, setEmail] = useState(() => (
    String(location.state?.email || location.state?.registrationPayload?.email || readStoredPendingRegistration()?.email || '').trim()
  ));
  const [sending, setSending] = useState(false);
  const [checkingConfirmation, setCheckingConfirmation] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let finishingRegistration = false;

    const finishIfConfirmed = async () => {
      if (finishingRegistration) return;
      finishingRegistration = true;
      try {
        const supabase = getSupabase();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!(user?.email_confirmed_at || user?.confirmed_at)) return;

        if (active) setCheckingConfirmation(true);
        const verifiedSession = { ...session, user };
        const business = await completePendingBusinessRegistration(verifiedSession);
        if (!active) return;

        writeStoredPendingRegistration(null);
        setSession(verifiedSession);
        setBusiness(business);
        navigate('/bienvenido', { replace: true });
      } catch (confirmationError) {
        if (active) {
          setError(confirmationError?.message || 'No pudimos completar la verificación. Abre de nuevo el enlace del correo.');
        }
      } finally {
        finishingRegistration = false;
        if (active) setCheckingConfirmation(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') finishIfConfirmed();
    };
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (session && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
        // Deja que Supabase termine de actualizar el almacenamiento antes de volver a consultar.
        window.setTimeout(finishIfConfirmed, 0);
      }
    });

    window.addEventListener('focus', finishIfConfirmed);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    finishIfConfirmed();

    return () => {
      active = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', finishIfConfirmed);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, setBusiness, setSession]);

  const normalizedInputEmail = email.trim();
  const isEmailChanged = Boolean(
    normalizedInputEmail &&
    (!registeredEmail || normalizedInputEmail.toLowerCase() !== registeredEmail.toLowerCase())
  );

  const handleBackToEdit = () => {
    navigate('/registro', {
      state: {
        restoreRegistration: {
          ...(savedRegistration || {}),
          email: normalizedInputEmail || registeredEmail,
        },
      },
    });
  };

  const handleResend = async (event) => {
    event.preventDefault();
    if (!normalizedInputEmail || !/^\S+@\S+\.\S+$/.test(normalizedInputEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setSending(true);
    setSentMessage('');
    setError('');
    try {
      if (isEmailChanged) {
        if (!savedRegistration) {
          navigate('/registro', {
            state: { restoreRegistration: { email: normalizedInputEmail } },
          });
          return;
        }

        const nextPayload = {
          ...savedRegistration,
          email: normalizedInputEmail,
        };
        const res = await registerBusiness(nextPayload);
        if (res?.session) {
          writeStoredPendingRegistration(null);
          setSession(res.session);
          setBusiness(res.negocio);
          addToast('Tienda creada', 'success');
          navigate('/bienvenido', { replace: true });
          return;
        }

        writeStoredPendingRegistration(nextPayload);
        setSavedRegistration(nextPayload);
        setRegisteredEmail(normalizedInputEmail);

        if (Array.isArray(res?.user?.identities) && res.user.identities.length === 0) {
          setSentMessage(
            `Si ${normalizedInputEmail} aún no tenía cuenta activa, te enviamos un enlace. Si ya lo habías registrado y confirmado antes, inicia sesión directamente.`
          );
        } else {
          setSentMessage(
            `Actualizamos tu correo a ${normalizedInputEmail} y te enviamos un nuevo enlace de confirmación. Revisa también Spam o Promociones.`
          );
          addToast('Enlace enviado al correo', 'success');
        }
        return;
      }

      await resendSignupConfirmation(normalizedInputEmail);
      setSentMessage(
        `Reenviamos el enlace de confirmación a ${normalizedInputEmail}. Si no aparece en unos minutos, revisa la carpeta de correo no deseado.`
      );
    } catch (sendError) {
      const message = String(sendError?.message || '');
      const cooldown = message.match(/only request this after\s+(\d+)\s+seconds?/i);

      if (cooldown) {
        const seconds = Number(cooldown[1]);
        setError(`Por seguridad, podrás solicitar otro correo en ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}.`);
      } else if (/too many requests|rate limit/i.test(message)) {
        setError('Has solicitado varios correos. Espera un momento antes de intentarlo de nuevo.');
      } else {
        setError(sendError?.message || 'No pudimos enviar el correo. Espera un momento e inténtalo de nuevo.');
      }
    } finally {
      setSending(false);
    }
  };

  if (checkingConfirmation) {
    return <PageLoading label="Activando tu cuenta" />;
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 px-4 text-slate-950">
      <SEO title="Confirma tu correo | NEGU" description="Confirma el correo de tu cuenta para continuar con la creación de tu tienda en NEGU." canonical="https://negu.pro/verificar-correo" noindex />
      <header className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center">
        <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-10 sm:h-11" /></Link>
      </header>
      <section className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-800"><MailCheck size={23} /></div>
          <p className="mt-5 text-sm font-semibold text-slate-500">Un paso más</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Confirma tu correo</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Te enviamos un enlace de verificación. Ábrelo desde tu correo para activar la cuenta y entrar al panel.</p>

          <form onSubmit={handleResend} className="mt-6 space-y-3">
            <label htmlFor="verification-email" className="block text-sm font-medium text-slate-700">Correo de tu cuenta</label>
            <input
              id="verification-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={event => { setEmail(event.target.value); setSentMessage(''); setError(''); }}
              placeholder="tu@correo.com"
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10"
            />
            {isEmailChanged && (
              <p className="text-xs leading-5 text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
                {savedRegistration
                  ? `Corregiste el correo. Al pulsar el botón enviaremos el enlace de activación a ${normalizedInputEmail} sin que tengas que volver a llenar tus datos.`
                  : 'Cambiaste el correo. Continúa al registro para confirmar el enlace con este nuevo correo.'}
              </p>
            )}
            <button
              type="submit"
              disabled={sending || !normalizedInputEmail}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                isEmailChanged && savedRegistration
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              {sending ? (
                <><LoadingSpinner size={16} /> Enviando enlace…</>
              ) : isEmailChanged ? (
                savedRegistration ? 'Actualizar correo y enviar enlace' : 'Continuar con este correo'
              ) : (
                'Reenviar correo de confirmación'
              )}
            </button>
          </form>

          {sentMessage && (
            <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{sentMessage}</span>
            </p>
          )}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBackToEdit}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              <ArrowLeft size={15} /> Corregir datos del registro
            </button>
            <Link to="/login" state={{ email: normalizedInputEmail || registeredEmail }} className="inline-flex min-h-10 items-center text-sm font-medium text-slate-600 hover:text-slate-950">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </section>
      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
