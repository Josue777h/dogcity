import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { signIn } from '../../lib/supabase';
import { useAuthStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function LoginPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const setSession = useAuthStore(s => s.setSession);
  const addToast   = useToastStore(s => s.addToast);

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(true);
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      addToast('¡Registro completado! Inicia sesión con tus credenciales.', 'success');
    }
  }, [location.state, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const session = await signIn(email, password);
      setSession(session);
      addToast('¡Bienvenido de nuevo!', 'success');
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('confirm') || msg.includes('not confirmed')) {
        addToast('Debes confirmar tu correo o desactivar "Confirm email" en Supabase.', 'error');
      } else {
        addToast('Correo o contraseña incorrectos.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <SEO
        title="Iniciar Sesión | Acceso al Panel NEGU"
        description="Ingresa a tu cuenta de NEGU para gestionar pedidos, actualizar productos, configurar delivery GPS y controlar tu negocio en tiempo real."
        canonical="https://negu.pro/login"
        noindex={false}
      />

      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <Link to="/" className="inline-flex w-fit rounded-lg"><SaaSLogo className="h-12" /></Link>
        <div className="relative z-10 max-w-xl pb-12">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">Panel de tu negocio</span>
          <h2 className="mt-6 text-4xl font-bold leading-tight text-white xl:text-5xl">Todo tu comercio,<br /><span className="text-cyan-300">en un solo lugar.</span></h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Administra pedidos, catálogo y ventas desde una plataforma simple, estés donde estés.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-xs font-medium text-slate-200"><span className="rounded-full bg-white/10 px-3 py-2">Pedidos organizados</span><span className="rounded-full bg-white/10 px-3 py-2">Catálogo actualizado</span><span className="rounded-full bg-white/10 px-3 py-2">Sin comisiones</span></div>
        </div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <p className="text-xs text-slate-500">NEGU · Herramientas para negocios locales</p>
      </aside>
      <div className="flex min-h-screen items-start justify-center px-4 pb-8 pt-5 sm:px-8 lg:items-center lg:px-12 lg:py-10">
      <div className="w-full max-w-[520px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150 mb-5 lg:mb-8"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>Volver al inicio</span>
        </Link>

        <div className="mb-6">
          <Link to="/" className="inline-block mb-5">
            <SaaSLogo className="h-9" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Inicia sesión
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Accede a tu panel de NEGU
          </p>
        </div>

        <Card className="w-full border border-slate-200 p-6 sm:p-8 shadow-md">
          {location.state?.email && (
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs text-emerald-800">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>Cuenta creada. Ingresa tu contraseña para continuar.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="py-3 pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <a
                  href="#olvido"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('Para restablecer tu contraseña, por favor contacta al soporte de Negu.', 'info');
                  }}
                  className="text-xs font-medium text-[#0284C7] hover:text-sky-700 transition-colors duration-150"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="py-3 pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors duration-150 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Recordarme en este equipo
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Comprobando acceso...</span>
                </>
              ) : (
                <span>Iniciar sesión</span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Nuevo en NEGU?{' '}
            <Link to="/registro" className="font-medium text-[#0284C7] hover:text-sky-700 transition-colors duration-150">
              Crea tu cuenta
            </Link>
          </p>
        </Card>
      </div>
      </div>
    </div>
  );
}
