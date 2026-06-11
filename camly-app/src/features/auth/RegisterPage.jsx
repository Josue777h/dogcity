import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Phone, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ShoppingBag, Truck, BarChart3, ShieldCheck, UserPlus, MessageCircle, Check } from 'lucide-react';
import { registerBusiness, signOut } from '../../lib/supabase';
import { useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import { getPasswordStrength } from '../../lib/utils';

const FEATURES = [
  { icon: ShoppingBag, text: 'CATÁLOGO EN LÍNEA' },
  { icon: MessageCircle, text: 'PEDIDOS POR WHATSAPP' },
  { icon: BarChart3, text: 'PANEL DE CONTROL' },
  { icon: Truck, text: 'DESPACHO A DOMICILIO' },
];

const STEPS = [
  { num: 1, label: 'Regístrate', desc: 'Crea tu cuenta en segundos' },
  { num: 2, label: 'Configura', desc: 'Personaliza tu tienda' },
  { num: 3, label: 'Vende', desc: 'Comparte y recibe pedidos' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const completedSteps = [
    form.businessName.length > 2,
    form.phone.length > 5 && form.email.includes('@'),
    form.password.length >= 8,
  ];
  const progress = (completedSteps.filter(Boolean).length / 3) * 100;
  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerBusiness(form);
      await signOut();
      addToast('¡Cuenta de negocio creada con éxito!', 'success');
      navigate('/login', { state: { email: form.email } });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isValid = (field) => {
    switch (field) {
      case 'businessName': return form.businessName.length > 2;
      case 'phone': return form.phone.length > 5;
      case 'email': return form.email.includes('@') && form.email.includes('.');
      case 'password': return form.password.length >= 8;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-bg-alt to-bg-alt lg:p-0">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 premium-card !p-0 shadow-2xl shadow-brand/20 animate-fade-in-up">
        
        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-dark text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-brand rounded-full blur-[120px] opacity-40 animate-orb" />
            <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-accent rounded-full blur-[100px] opacity-30 animate-orb" style={{ animationDelay: '-4s' }} />
          </div>

          <div className="relative z-10">
            <SaaSLogo className="h-16 mb-10 text-white" />
            <h2 className="text-5xl font-black leading-none tracking-tighter uppercase italic mb-6">
              LLEVA TU NEGOCIO AL <span className="gradient-text">SIGUIENTE NIVEL.</span>
            </h2>
            <p className="text-lg text-white/50 font-medium leading-relaxed max-w-md">
              La plataforma definitiva para gestionar pedidos por WhatsApp de forma profesional, rápida y escalable.
            </p>
          </div>

          {/* Steps visual */}
          <div className="relative z-10 space-y-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all duration-300 ${completedSteps[i] ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/10 text-white/40'}`}>
                  {completedSteps[i] ? <Check size={18} /> : step.num}
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest ${completedSteps[i] ? 'text-white' : 'text-white/40'}`}>{step.label}</p>
                  <p className="text-[10px] text-white/30 font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-10">
            {FEATURES.map((feat, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="p-2 bg-white/5 rounded-lg text-brand group-hover:scale-110 transition-transform">
                  <feat.icon size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-black text-dark tracking-tighter uppercase">COMENZAR AHORA</h3>
            <p className="text-sm text-muted font-bold tracking-widest uppercase mt-1">Crea tu cuenta en menos de 2 minutos</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-muted uppercase tracking-widest">Progreso</span>
              <span className="text-[10px] font-black text-brand uppercase tracking-widest">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-bg-alt rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${focusedField === 'businessName' ? 'text-brand' : 'text-muted'}`}>Nombre Comercial</label>
              <div className="relative">
                <Store size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'businessName' ? 'text-brand' : 'text-muted'}`} />
                <input 
                  type="text" placeholder="Ej: Pizza Hut Gourmet" 
                  value={form.businessName} onChange={set('businessName')}
                  onFocus={() => setFocusedField('businessName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-10 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                  required 
                />
                {isValid('businessName') && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${focusedField === 'phone' ? 'text-brand' : 'text-muted'}`}>WhatsApp Negocio</label>
                <div className="relative">
                  <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'phone' ? 'text-brand' : 'text-muted'}`} />
                  <input 
                    type="tel" placeholder="573..." 
                    value={form.phone} onChange={set('phone')}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-10 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                    required 
                  />
                  {isValid('phone') && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />}
                </div>
              </div>
              <div className="space-y-1">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${focusedField === 'email' ? 'text-brand' : 'text-muted'}`}>Email Acceso</label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-brand' : 'text-muted'}`} />
                  <input 
                    type="email" placeholder="tu@empresa.com" 
                    value={form.email} onChange={set('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-10 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                    required 
                  />
                  {isValid('email') && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 transition-colors ${focusedField === 'password' ? 'text-brand' : 'text-muted'}`}>Contraseña de Seguridad</label>
              <div className="relative">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-brand' : 'text-muted'}`} />
                <input 
                  type="password" placeholder="Mínimo 8 caracteres" 
                  value={form.password} onChange={set('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  minLength={8}
                  className="w-full pl-12 pr-10 py-3.5 bg-bg-alt border border-border rounded-2xl input-glow font-bold text-sm"
                  required 
                />
                {isValid('password') && <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-success" />}
              </div>
              {form.password && (
                <div className="space-y-1.5 px-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${passwordStrength.score === 3 ? 'text-success' : passwordStrength.score === 2 ? 'text-warning' : 'text-error'}`}>
                    Seguridad: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary !py-5 shadow-2xl shadow-brand/20 mt-6 !rounded-2xl group"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : (
                <div className="flex items-center gap-2 uppercase font-black tracking-widest text-xs">
                  CREAR MI TIENDA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted font-medium">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-brand font-black hover:underline">Acceder al panel</Link>
          </p>
          
          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted">
              <ShieldCheck size={16} className="text-success" />
              <span className="text-[10px] font-black uppercase tracking-widest">Protección GDPR</span>
            </div>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-bg-alt overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-dark flex items-center justify-center text-[10px] font-bold text-white z-10 animate-fade-in-up" style={{ animationDelay: '320ms', animationFillMode: 'both' }}>+50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
