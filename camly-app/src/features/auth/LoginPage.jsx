import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { signIn } from '../../lib/supabase';
import { useAuthStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';

const TESTIMONIALS = [
  { quote: 'CAMLY transformó completamente nuestra operación de delivery. Ahora los pedidos entran sin errores.', author: 'María Lopera', role: 'Restaurante El Sabor Colombiano' },
  { quote: 'Mis clientes hacen sus pedidos mucho más rápido y mis repartidores ya no se pierden con la dirección.', author: 'Carlos Restrepo', role: 'Pizza Express & Burger' },
  { quote: 'El panel de control es tan intuitivo que capacitamos al equipo en menos de 10 minutos.', author: 'Ana Sofía Pérez', role: 'Café & Bistro Central' },
];

export default function LoginPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const setSession    = useAuthStore(s => s.setSession);
  const addToast      = useToastStore(s => s.addToast);

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      addToast('¡Registro completado! Inicia sesión con tus credenciales.', 'success');
    }
  }, [location.state, addToast]);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(timer);
  }, []);

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

  const testimonial = TESTIMONIALS[testimonialIdx];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Top back navigation */}
      <div className="w-full max-w-4xl mx-auto mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-gray-200/60"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto card overflow-hidden shadow-xl border-gray-200/80 bg-white grid grid-cols-1 lg:grid-cols-12 animate-fade-in-up">
        
        {/* ── LEFT PANEL (Branding & Trust) ── */}
        <div className="hidden lg:flex lg:col-span-5 bg-gray-900 text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          <div>
            <div className="mb-8">
              <SaaSLogo className="h-8 text-white" />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
              Panel Administrativo
            </p>

            <h2 className="text-2xl font-black tracking-tight text-white leading-snug mb-3">
              Administra tu tienda digital desde un solo lugar.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Controla pedidos de WhatsApp, actualiza tu menú en tiempo real y asigna entregas sin enredos.
            </p>

            <div className="mt-7 space-y-3 text-xs text-gray-300">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>Notificaciones de nuevos pedidos en vivo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>Ubicación GPS de cada cliente en un clic</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>Estadísticas de ventas diarias y mensuales</span>
              </div>
            </div>
          </div>

          {/* Testimonial slider with editorial left border */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="border-l-2 border-orange-500 pl-3.5 py-1">
              <p className="text-xs text-gray-300 italic leading-relaxed mb-2">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="text-xs font-bold text-white">{testimonial.author}</p>
                <p className="text-[11px] text-gray-400">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex gap-1.5 mt-4 justify-start pl-3.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === testimonialIdx ? 'w-5 bg-orange-500' : 'w-1.5 bg-white/20'
                  }`}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Form ── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mobile SaaS Logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <SaaSLogo className="h-8" />
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Ingresa tus credenciales para acceder a tu panel de control.
            </p>
          </div>

          {/* Alert if newly registered */}
          {location.state?.email && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-fade-in-down">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>¡Cuenta creada con éxito! Ingresa tu contraseña para acceder.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@tunegocio.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10 pr-3"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-semibold mt-2 shadow-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              <span>{loading ? 'Comprobando acceso...' : 'Entrar a mi panel'}</span>
            </button>
          </form>

          {/* Footer switcher */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Aún no tienes una tienda?{' '}
              <Link to="/registro" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                Crear tienda gratis
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Conexión segura SSL · Datos 100% protegidos</span>
          </div>

        </div>

      </div>
    </div>
  );
}
