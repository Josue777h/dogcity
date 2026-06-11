import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ChevronRight, Store, ArrowLeft, ShieldCheck, Quote } from 'lucide-react';
import { signIn } from '../../lib/supabase';
import { useAuthStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import { useAnimatedCounter } from '../../lib/utils';

const TESTIMONIALS = [
  { quote: 'CAMLY transformó completamente nuestra operación de delivery.', author: 'María L.', role: 'Restaurante El Sabor' },
  { quote: 'Mis clientes piden más rápido y cometo menos errores.', author: 'Carlos R.', role: 'Pizza Express' },
  { quote: 'El panel es tan simple que lo aprendí en 10 minutos.', author: 'Ana P.', role: 'Café Central' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const addToast = useToastStore((s) => s.addToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const ordersCount = useAnimatedCounter(1200, 1800);
  const businessesCount = useAnimatedCounter(50, 1500);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      addToast('¡Registro completado! Inicia sesión con tus credenciales', 'success');
    }
  }, [location.state, addToast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const session = await signIn(email, password);
      setSession(session);
      addToast('Sesión iniciada correctamente', 'success');
      navigate('/admin');
    } catch (err) {
      console.error('Login error:', err);
      addToast('Credenciales incorrectas o usuario no encontrado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testimonial = TESTIMONIALS[testimonialIdx];

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-bg-alt to-bg-alt lg:p-0 relative">
      <Link 
        to="/" 
        className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted hover:text-dark transition-colors z-20 pt-safe"
      >
        <ArrowLeft size={16} /> Volver al Inicio
      </Link>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 premium-card !p-0 shadow-2xl shadow-brand/15 animate-fade-in-up">
        
        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-brand rounded-full blur-[120px] opacity-40 animate-orb" />
            <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-accent rounded-full blur-[100px] opacity-30 animate-orb" style={{ animationDelay: '-4s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10">
            <SaaSLogo className="h-16 mb-10 text-white" />
            <h2 className="text-5xl font-black leading-none tracking-tighter uppercase italic mb-6">
              ADMINISTRA TU <span className="gradient-text">TIENDA DIGITAL.</span>
            </h2>
            <p className="text-lg text-white/50 font-medium leading-relaxed max-w-md">
              Controla tus pedidos de WhatsApp, actualiza tu menú y haz seguimiento a tus repartidores desde un solo lugar.
            </p>
          </div>

          {/* Rotating testimonial */}
          <div className="relative z-10 glass-dark rounded-2xl p-6 transition-all duration-500">
            <Quote size={20} className="text-brand/40 mb-3" />
            <p className="text-sm font-medium text-white/80 italic leading-relaxed mb-4 transition-opacity duration-300">
              "{testimonial.quote}"
            </p>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{testimonial.author}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{testimonial.role}</p>
            </div>
            <div className="flex gap-1.5 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-6 bg-brand' : 'w-2 bg-white/20'}`} />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 border-t border-white/10 pt-8 grid grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-black text-brand tracking-tighter">{ordersCount}+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pedidos procesados</p>
            </div>
            <div>
              <p className="text-3xl font-black text-accent tracking-tighter">{businessesCount}+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Negocios activos</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl lg:hidden" />
          
          <div className="mb-10 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6 lg:hidden">
              <SaaSLogo className="h-12" />
            </div>
            <h3 className="text-3xl font-black text-dark tracking-tighter uppercase italic">INICIAR SESIÓN</h3>
            <p className="text-sm text-muted font-bold tracking-widest uppercase mt-1">Ingresa a tu panel de administración</p>
          </div>

          {location.state?.email && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-2xl flex items-center gap-3 text-success animate-fade-in-down">
              <ShieldCheck className="shrink-0" size={20} />
              <div className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                ¡Cuenta creada! Introduce tu contraseña para acceder.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-all duration-200 ${focusedField === 'email' ? 'text-brand' : 'text-muted'}`}>
                Email Registrado
              </label>
              <div className="relative">
                <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-brand' : 'text-muted'}`} />
                <input 
                  type="email" 
                  placeholder="admin@tunegocio.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-all duration-200 ${focusedField === 'password' ? 'text-brand' : 'text-muted'}`}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-brand' : 'text-muted'}`} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-12 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full btn-primary !py-5 shadow-2xl shadow-brand/20 mt-6 !rounded-2xl group relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Loader2 size={24} className="animate-spin" />
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/60 rounded-full animate-[shimmer_1s_ease_infinite]" style={{ width: '60%', backgroundSize: '200% 100%' }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 uppercase font-black tracking-widest text-xs">
                    ACCEDER AL PANEL <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-muted font-medium">
            ¿No tienes una cuenta comercial? <Link to="/registro" className="text-brand font-black hover:underline">Crear mi tienda</Link>
          </p>

          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted pulse-new rounded-full px-3 py-1.5">
              <ShieldCheck size={16} className="text-success" />
              <span className="text-[10px] font-black uppercase tracking-widest">Conexión Segura SSL</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted/40">
              Powered by Camly
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
