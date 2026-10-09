import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, Phone, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { registerBusiness, signOut } from '../../lib/supabase';
import { useToastStore, useAuthStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';
import SEO from '../../components/common/SEO';
import { getPasswordStrength } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function RegisterPage() {
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedSlug = searchParams.get('tienda') || '';
  const addToast   = useToastStore(s => s.addToast);
  const setSession = useAuthStore(s => s.setSession);

  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [slugEdited, setSlugEdited] = useState(Boolean(requestedSlug));
  const [form, setForm] = useState({
    businessName: '',
    storeSlug: requestedSlug,
    phone: '',
    email: '',
    password: '',
  });

  const slugify = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35);
  const set = (field) => (e) => {
    const value = e.target.value;
    if (field === 'storeSlug') setSlugEdited(true);
    setForm(current => ({ ...current, [field]: value,
      ...(field === 'businessName' && !slugEdited ? { storeSlug: slugify(value) } : {}),
    }));
  };
  const normalizedSlug = slugify(form.storeSlug || form.businessName);

  const passwordStrength = getPasswordStrength(form.password);
  const isPasswordValid = form.password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !normalizedSlug || !form.phone.trim() || !form.email.trim() || !isPasswordValid) {
      addToast('Por favor completa todos los campos (contraseña mínimo 8 caracteres).', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await registerBusiness({ ...form, storeSlug: normalizedSlug });
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
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <SEO
        title="¡Comenzar Gratis! | NEGU — Software para Restaurantes y Negocios"
        description="Crea tu catálogo interactivo y menú digital para tu restaurante o tienda en 3 minutos. Prueba gratis por 7 días sin tarjeta y con 0% comisiones."
        canonical="https://negu.pro/registro"
        noindex={false}
      />

      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <Link to="/" className="inline-flex w-fit rounded-lg"><SaaSLogo className="h-12" /></Link>
        <div className="relative z-10 max-w-xl pb-12">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">Empieza hoy</span>
          <h2 className="mt-6 text-4xl font-bold leading-tight text-white xl:text-5xl">Tu negocio en línea,<br /><span className="text-cyan-300">a tu manera.</span></h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Crea tu catálogo y recibe pedidos por WhatsApp. Configura tu tienda en unos pocos pasos.</p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm font-semibold">Sin tarjeta de crédito</p><p className="mt-1 text-sm text-slate-400">Prueba NEGU y administra tus ventas sin comisiones por pedido.</p></div>
        </div>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <p className="text-xs text-slate-500">NEGU · Herramientas para negocios locales</p>
      </aside>
      <div className="flex min-h-screen items-start justify-center px-4 pb-8 pt-5 sm:px-8 lg:items-center lg:px-12 lg:py-10">
      <div className="w-full max-w-[520px] mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150 mb-4 lg:mb-6"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          <span>Volver al inicio</span>
        </Link>

        <div className="mb-6">
          <Link to="/" className="inline-block mb-5">
            <SaaSLogo className="h-9" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Crea tu cuenta
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Empieza a digitalizar tu negocio con NEGU
          </p>
        </div>

        <Card className="w-full border border-slate-200 p-6 sm:p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-2 flex items-center gap-2" aria-label={`Paso ${step} de 2`}>
              {[1, 2].map(number => <span key={number} className={`h-1.5 flex-1 rounded-full ${step >= number ? 'bg-brand' : 'bg-slate-200'}`} />)}
              <span className="ml-1 text-xs font-medium text-slate-500">Paso {step} de 2</span>
            </div>
            {step === 1 && <>
            <div>
              <label htmlFor="reg-business" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre de tu negocio
              </label>
              <div className="relative">
                <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="reg-business"
                  type="text"
                  placeholder="Ej: Burger House"
                  value={form.businessName}
                  onChange={set('businessName')}
                  className="py-3 pl-10 pr-10"
                  required
                />
                {form.businessName.trim().length >= 2 && (
                  <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reg-slug" className="block text-sm font-medium text-slate-700 mb-1.5">Enlace de tu tienda</label>
              <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-slate-900/5">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-500">negu.pro/</span>
                <input id="reg-slug" value={form.storeSlug} onChange={set('storeSlug')} placeholder="mi-negocio" className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" required />
              </div>
              <p className="mt-1 text-xs text-slate-500">Tu catálogo quedará en negu.pro/{normalizedSlug || 'mi-negocio'}.</p>
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                WhatsApp del negocio
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="Ej: 573001234567"
                  value={form.phone}
                  onChange={set('phone')}
                  className="py-3 pl-10 pr-10"
                  required
                />
                {form.phone.trim().length >= 7 && (
                  <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

            <Button type="button" fullWidth onClick={() => {
              if (!form.businessName.trim() || !normalizedSlug || !form.phone.trim()) {
                addToast('Completa el nombre, el enlace y el WhatsApp para continuar.', 'warning');
                return;
              }
              setStep(2);
            }}>Continuar</Button>
            </>}

            {step === 2 && <>
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={set('email')}
                  className="py-3 pl-10 pr-10"
                  required
                  autoComplete="email"
                />
                {form.email.includes('@') && form.email.includes('.') && (
                  <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={set('password')}
                  minLength={8}
                  className="py-3 pl-10 pr-10"
                  required
                  autoComplete="new-password"
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

              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span
                  className={`text-xs ${
                    form.password.length > 0 && !isPasswordValid
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  Mínimo 8 caracteres
                </span>
                {form.password && (
                  <span className="text-xs font-medium text-slate-500">
                    {passwordStrength.label}
                  </span>
                )}
              </div>

              {form.password && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                        i <= passwordStrength.score
                          ? passwordStrength.score === 3
                            ? 'bg-emerald-500'
                            : passwordStrength.score === 2
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creando tu tienda...</span>
                </>
              ) : (
                <span>Crear mi cuenta</span>
              )}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => setStep(1)}>Volver al negocio</Button>
            </>}
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-[#0284C7] hover:text-sky-700 transition-colors duration-150">
              Inicia sesión
            </Link>
          </p>
        </Card>
      </div>
      </div>
    </div>
  );
}
