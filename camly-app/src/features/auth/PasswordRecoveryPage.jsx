import { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { requestPasswordRecovery } from '../../lib/supabase';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function PasswordRecoveryPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await requestPasswordRecovery(email);
      setSent(true);
    } catch (requestError) {
      const message = String(requestError?.message || '');
      if (/rate limit|too many requests/i.test(message)) {
        setError('Has solicitado varios enlaces. Espera un momento antes de intentarlo de nuevo.');
      } else {
        setError('No pudimos enviar la solicitud. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50 px-4 text-slate-950">
      <SEO title="Recuperar contraseña | NEGU" description="Recupera el acceso a tu cuenta de NEGU." canonical="https://negu.pro/recuperar-contrasena" noindex />
      <header className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center">
        <Link to="/" aria-label="NEGU, inicio"><SaaSLogo className="h-10" /></Link>
      </header>

      <section className="flex w-full min-w-0 flex-1 items-center justify-center py-8">
        <div className="w-full min-w-0 max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            {sent ? <CheckCircle2 size={23} /> : <KeyRound size={23} />}
          </div>

          {sent ? (
            <div role="status" aria-live="polite">
              <p className="mt-5 text-sm font-semibold text-slate-500">Revisa tu correo</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Solicitud enviada</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Si existe una cuenta de NEGU con ese correo, recibirás un enlace para crear una nueva contraseña. Revisa también la carpeta de correo no deseado.
              </p>
              <p className="mt-4 break-all rounded-xl bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700">{email.trim()}</p>
              <Button type="button" variant="secondary" fullWidth className="mt-5" onClick={() => { setSent(false); setError(''); }}>
                Enviar otra vez
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-5 text-sm font-semibold text-slate-500">Recupera el acceso</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">¿Olvidaste tu contraseña?</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Escribe el correo de tu cuenta y te enviaremos un enlace seguro para crear una nueva.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  id="recovery-email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={event => { setEmail(event.target.value); setError(''); }}
                  placeholder="tu@correo.com"
                  iconLeft={<Mail size={16} />}
                  className="min-h-11 pl-10"
                />
                {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700">{error}</p>}
                <Button type="submit" fullWidth loading={loading} className="min-h-11">
                  {loading ? 'Enviando enlace…' : 'Enviar enlace de recuperación'}
                </Button>
              </form>
            </>
          )}

          <Link to="/login" state={{ email }} className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950">
            <ArrowLeft size={15} /> Volver a iniciar sesión
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl py-4 text-center text-xs text-slate-400">NEGU · Herramientas para negocios locales</footer>
    </main>
  );
}
