import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { signIn } from '../../lib/supabase';
import { useAuthStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';

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
      navigate('/admin');
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
    <div className="min-h-screen bg-[#F6F4EF] text-gray-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background ambient radial gradients (Wenú style) */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(1000px 500px at 85% -5%, rgba(239, 246, 255, 0.9) 0%, transparent 60%),
            radial-gradient(900px 550px at -5% 35%, rgba(254, 243, 199, 0.45) 0%, transparent 55%),
            radial-gradient(800px 450px at 50% 100%, rgba(243, 244, 246, 0.7) 0%, transparent 50%)
          `
        }}
      />

      {/* Floating Back Button (Wenú style pill) */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-40">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border border-gray-200/80 shadow-xs hover:shadow-warm transition-all duration-150 backdrop-blur-sm"
        >
          <ArrowLeft size={15} strokeWidth={2.5} />
          <span>Regresar</span>
        </Link>
      </div>

      <div className="w-full max-w-[430px] mx-auto flex flex-col items-center">
        
        {/* Header with Centered Logo & Display Title */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Link to="/" className="inline-block transition-transform hover:scale-[1.02] mb-3">
            <SaaSLogo className="h-11 sm:h-12" />
          </Link>

          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#0284C7] mb-1.5">
            Acceso Clientes
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            ¡Bienvenido de vuelta!
          </h1>
          
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
            Tu negocio no para, y nosotros tampoco.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-200/80 transition-all">
          
          {/* Notification if newly registered */}
          {location.state?.email && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>¡Cuenta creada con éxito! Ingresa tu contraseña para acceder.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative flex items-center">
                <Mail size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-900">
                  Contraseña
                </label>
                <a
                  href="#olvido"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('Para restablecer tu contraseña, por favor contacta al soporte de Negu.', 'info');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs font-medium text-gray-600 cursor-pointer select-none">
                Recordarme en este equipo
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-glow-blue flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Comprobando acceso...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-semibold text-gray-400">o</span>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Nuevo en Negu?{' '}
              <Link to="/registro" className="font-bold text-[#0284C7] hover:text-sky-700 hover:underline">
                Crea tu cuenta aquí
              </Link>
            </p>
          </div>

        </div>

        {/* Footer Brand Note (Wenú style) */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
          <Heart size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
          <span>Tu parcero digital · te acompañamos en cada paso.</span>
        </div>

      </div>
    </div>
  );
}
