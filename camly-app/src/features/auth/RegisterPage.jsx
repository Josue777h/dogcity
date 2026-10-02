import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Phone, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ShoppingBag, Truck, BarChart3, ShieldCheck, MessageCircle, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { registerBusiness, signOut } from '../../lib/supabase';
import { useToastStore, useAuthStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import { getPasswordStrength } from '../../lib/utils';

const FEATURES = [
  { icon: ShoppingBag,   text: 'Menú digital responsive' },
  { icon: MessageCircle, text: 'Pedidos directos con GPS' },
  { icon: BarChart3,     text: 'Panel de ventas en vivo' },
  { icon: Truck,         text: 'Gestión de domiciliarios' },
];

const STEPS = [
  { num: 1, label: 'Negocio',   desc: 'Nombre comercial' },
  { num: 2, label: 'Contacto',  desc: 'WhatsApp y correo' },
  { num: 3, label: 'Seguridad', desc: 'Contraseña de acceso' },
];

export default function RegisterPage() {
  const navigate   = useNavigate();
  const addToast   = useToastStore(s => s.addToast);
  const setSession = useAuthStore(s => s.setSession);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '', phone: '', email: '', password: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  // Correct step completion logic
  const isStep1Complete = form.businessName.trim().length >= 2;
  const isStep2Complete = form.phone.trim().length >= 7 && form.email.includes('@') && form.email.includes('.');
  const isStep3Complete = form.password.length >= 8;

  const completedSteps = [isStep1Complete, isStep2Complete, isStep3Complete];
  const progress = (completedSteps.filter(Boolean).length / 3) * 100;
  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep1Complete || !isStep2Complete || !isStep3Complete) {
      addToast('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await registerBusiness(form);
      if (res?.session) {
        setSession(res?.session);
        addToast('¡Cuenta y negocio creados con éxito!', 'success');
        navigate('/bienvenido');
      } else {
        await signOut();
        addToast('¡Cuenta creada! Si tienes confirmación activa, revisa tu correo.', 'success');
        navigate('/login', { state: { email: form.email } });
      }
    } catch (err) {
      addToast(err.message || 'Error al crear la tienda', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        
        {/* ── LEFT PANEL: Steps & Value Props ── */}
        <div className="hidden lg:flex lg:col-span-5 bg-gray-900 text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          <div>
            <div className="mb-8">
              <SaaSLogo className="h-8 text-white" />
            </div>

            <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
              Prueba gratis por 7 días
            </p>

            <h2 className="text-2xl font-black tracking-tight text-white leading-snug mb-3">
              Lleva tu negocio al <span className="text-orange-500">siguiente nivel</span>.
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crea tu catálogo en línea y comienza a recibir pedidos con GPS directamente en tu WhatsApp.
            </p>

            {/* Steps indicator */}
            <div className="space-y-4 my-8">
              {STEPS.map((step, i) => {
                const isDone = completedSteps[i];
                return (
                  <div key={step.num} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        isDone 
                          ? 'bg-orange-600 text-white shadow-xs' 
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : step.num}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isDone ? 'text-white' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features grid */}
          <div className="pt-6 border-t border-gray-800 grid grid-cols-2 gap-3 text-xs text-gray-300">
            {FEATURES.map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <feat.icon size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">{feat.text}</span>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT PANEL: Registration Form ── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mobile Logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <SaaSLogo className="h-8" />
          </div>

          <div className="mb-5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Crear mi tienda digital
            </h1>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Comienza en menos de 2 minutos. No requieres tarjeta de crédito.
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
              <span className="text-gray-500">Completando datos</span>
              <span className="text-orange-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Business name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nombre de tu negocio
              </label>
              <div className="relative">
                <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej: Burger House o Café Gourmet"
                  value={form.businessName}
                  onChange={set('businessName')}
                  className="input-field pl-10 pr-9 text-sm"
                  required
                />
                {isStep1Complete && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  WhatsApp del negocio
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="Ej: 573001234567"
                    value={form.phone}
                    onChange={set('phone')}
                    className="input-field pl-10 pr-9 text-sm"
                    required
                  />
                  {form.phone.trim().length >= 7 && (
                    <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="tu@negocio.com"
                    value={form.email}
                    onChange={set('email')}
                    className="input-field pl-10 pr-9 text-sm"
                    required
                  />
                  {form.email.includes('@') && form.email.includes('.') && (
                    <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Contraseña (mínimo 8 caracteres)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  minLength={8}
                  className="input-field pl-10 pr-9 text-sm"
                  required
                />
                {isStep3Complete && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                )}
              </div>

              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                          i <= passwordStrength.score
                            ? passwordStrength.score === 3
                              ? 'bg-emerald-500'
                              : passwordStrength.score === 2
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium text-gray-500">
                    Seguridad: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-semibold mt-3 shadow-sm"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Crear mi tienda gratis</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer switcher */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Ya tienes una cuenta creada?{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Sin tarjeta de crédito · Cancela cuando quieras</span>
          </div>

        </div>

      </div>
    </div>
  );
}
