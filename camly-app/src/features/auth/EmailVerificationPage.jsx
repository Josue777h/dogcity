import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MailCheck } from 'lucide-react';
import { resendSignupConfirmation } from '../../lib/supabase';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function EmailVerificationPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async (event) => {
    event.preventDefault();
    setSending(true);
    setSent(false);
    setError('');
    try {
      await resendSignupConfirmation(email);
      setSent(true);
    } catch (sendError) {
      const message = String(sendError?.message || '');
      const cooldown = message.match(/only request this after\s+(\d+)\s+seconds?/i);

      if (cooldown) {
        const seconds = Number(cooldown[1]);
        setError(`Por seguridad, podrás solicitar otro correo en ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}.`);
      } else if (/too many requests|rate limit/i.test(message)) {
        setError('Has solicitado varios correos. Espera un momento antes de intentarlo de nuevo.');
      } else {
        setError('No pudimos reenviar el correo. Espera un momento e inténtalo de nuevo.');
      }
    } finally {
      setSending(false);
    }
  };

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
              onChange={event => { setEmail(event.target.value); setSent(false); setError(''); }}
              placeholder="tu@correo.com"
              className="min-h-11 w-full rounded-xl border border-slate-300 px-3.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10"
            />
            <button type="submit" disabled={sending || !email.trim()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              {sending ? <><LoadingSpinner size={16} /> Enviando enlace…</> : 'Reenviar correo de confirmación'}
            </button>
          </form>

          {sent && <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> Si la cuenta está pendiente, enviaremos otro enlace. Revisa también la carpeta de correo no deseado.</p>}
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</p>}

          <Link to="/login" state={{ email }} className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft size={15} /> Volver a iniciar sesión</Link>
        </div>
      </section>
      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
