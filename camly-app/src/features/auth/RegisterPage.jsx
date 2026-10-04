import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Users, CheckCircle2 } from 'lucide-react';
import { registerBusiness, signOut } from '../../lib/supabase';
import { useToastStore, useAuthStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import { getPasswordStrength } from '../../lib/utils';

export default function RegisterPage() {
  const navigate   = useNavigate();
  const addToast   = useToastStore(s => s.addToast);
  const setSession = useAuthStore(s => s.setSession);

  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    email: '',
    password: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const passwordStrength = getPasswordStrength(form.password);
  const isPasswordValid = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.phone.trim() || !form.email.trim() || !isPasswordValid) {
      addToast('Por favor completa todos los campos (contraseña mínimo 8 caracteres).', 'warning');
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
    <div className="min-h-screen bg-[#F6F4EF] text-gray-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 relative overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      <SEO 
        title="Crear cuenta gratis | NEGU"
        description="Regístrate en NEGU y prueba 7 días gratis el menú digital interactivo y pedidos por WhatsApp."
        canonical="https://negu.pro/registro"
        noindex={true}
      />
      
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

      <div className="w-full max-w-[440px] mx-auto flex flex-col items-center">
        
        {/* Header with Centered Logo & Display Title */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Link to="/" className="inline-block transition-transform hover:scale-[1.02] mb-3">
            <SaaSLogo className="h-11 sm:h-12" />
          </Link>

          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#0284C7] mb-1.5">
            Crear Cuenta
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
            ¡Únete a Negu!
          </h1>
          
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
            Crea tu cuenta y empieza a digitalizar tu negocio.
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="w-full bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-200/80 transition-all">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Business Name Field */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Nombre de tu negocio
              </label>
              <div className="relative flex items-center">
                <Store size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej: Burger House o Café Gourmet"
                  value={form.businessName}
                  onChange={set('businessName')}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                />
                {form.businessName.trim().length >= 2 && (
                  <CheckCircle2 size={16} className="absolute right-3.5 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

            {/* WhatsApp Phone Field */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                WhatsApp del negocio
              </label>
              <div className="relative flex items-center">
                <Phone size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Ej: 573001234567"
                  value={form.phone}
                  onChange={set('phone')}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                />
                {form.phone.trim().length >= 7 && (
                  <CheckCircle2 size={16} className="absolute right-3.5 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

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
                  value={form.email}
                  onChange={set('email')}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                  autoComplete="email"
                />
                {form.email.includes('@') && form.email.includes('.') && (
                  <CheckCircle2 size={16} className="absolute right-3.5 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crea una contraseña segura"
                  value={form.password}
                  onChange={set('password')}
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3 bg-[#FAFAF8] hover:bg-white focus:bg-white text-gray-900 text-sm font-medium rounded-2xl border border-gray-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/15 transition-all placeholder:text-gray-400 placeholder:font-normal"
                  required
                  autoComplete="new-password"
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

              {/* Password Helper & Strength Meter */}
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span className={form.password.length > 0 && !isPasswordValid ? 'text-amber-600 font-semibold' : ''}>
                    Mínimo 8 caracteres
                  </span>
                  {form.password && (
                    <span className="font-semibold text-gray-600">
                      {passwordStrength.label}
                    </span>
                  )}
                </div>

                {form.password && (
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
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
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-6 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-glow-blue flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creando tu tienda...</span>
                </>
              ) : (
                <>
                  <span>Crear mi cuenta</span>
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

          {/* Switch to Login */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </div>

        {/* Footer Brand Note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
          <Users size={14} className="text-[#0284C7] shrink-0" />
          <span>Miles de emprendedores ya usan Negu.</span>
        </div>

      </div>
    </div>
  );
}
