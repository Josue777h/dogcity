import { useState } from 'react';
import { Store, Phone, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ShoppingBag, Truck, BarChart3, ShieldCheck, UserPlus } from 'lucide-react';
import { registerBusiness } from '../../lib/supabase';
import { useToastStore } from '../../stores';

const FEATURES = [
  { icon: ShoppingBag, text: 'CATÁLOGO EN LÍNEA' },
  { icon: MessageCircle, text: 'PEDIDOS POR WHATSAPP' },
  { icon: BarChart3, text: 'PANEL DE CONTROL' },
  { icon: Truck, text: 'DESPACHO A DOMICILIO' },
];

import { MessageCircle } from 'lucide-react';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function RegisterPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    businessName: '',
    phone: '',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerBusiness(form);
      addToast('¡Negocio creado! Bienvenido', 'success');
      window.location.href = '/bienvenido';
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-bg-alt to-bg-alt lg:p-0">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 premium-card !p-0 shadow-2xl shadow-brand/20 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* ── LEFT: Marketing / Brand ─────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-dark text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-brand/10 opacity-50 select-none pointer-events-none">
              <div className="absolute top-1/4 -right-20 w-80 h-80 bg-brand rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-accent rounded-full blur-[100px]" />
           </div>

           <div className="relative z-10">
              <SaaSLogo className="h-16 mb-10 text-white" />
              <h2 className="text-5xl font-black leading-none tracking-tighter uppercase italic mb-6">
                LLEVA TU NEGOCIO AL <span className="text-brand">SIGUIENTE NIVEL.</span>
              </h2>
              <p className="text-lg text-white/50 font-medium leading-relaxed max-w-md">
                La plataforma definitiva para gestionar pedidos por WhatsApp de forma profesional, rápida y escalable.
              </p>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-brand">
                    <feat.icon size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{feat.text}</span>
                </div>
              ))}
           </div>
        </div>

        {/* ── RIGHT: Form ─────────────────────────────────── */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-black text-dark tracking-tighter uppercase">COMENZAR AHORA</h3>
            <p className="text-sm text-muted font-bold tracking-widest uppercase mt-1">Crea tu cuenta en menos de 2 minutos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Comercial</label>
              <div className="relative">
                <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="text" placeholder="Ej: Pizza Hut Gourmet" 
                  value={form.businessName} onChange={set('businessName')}
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-alt border border-border rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">WhatsApp Negocio</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input 
                      type="tel" placeholder="573..." 
                      value={form.phone} onChange={set('phone')}
                      className="w-full pl-12 pr-4 py-3.5 bg-bg-alt border border-border rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                      required 
                    />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Email Acceso</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                    <input 
                      type="email" placeholder="tu@empresa.com" 
                      value={form.email} onChange={set('email')}
                      className="w-full pl-12 pr-4 py-3.5 bg-bg-alt border border-border rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                      required 
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Contraseña de Seguridad</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input 
                  type="password" placeholder="Mínimo 6 caracteres" 
                  value={form.password} onChange={set('password')}
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3.5 bg-bg-alt border border-border rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full btn-primary !py-5 shadow-2xl shadow-brand/20 mt-6 !rounded-2xl"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <div className="flex items-center gap-2">CREAR MI TIENDA <ArrowRight size={20} /></div>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted font-medium">
            ¿Ya tienes una cuenta? <a href="/admin" className="text-brand font-black hover:underline">Acceder al panel</a>
          </p>
          
          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-muted">
                <ShieldCheck size={16} className="text-success" />
                <span className="text-[10px] font-black uppercase tracking-widest">Protección GDPR</span>
             </div>
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-bg-alt overflow-hidden"><img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" /></div>)}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-dark flex items-center justify-center text-[10px] font-bold text-white z-10">+50</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
