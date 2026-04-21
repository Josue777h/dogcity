import { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { useBusinessStore } from '../../stores';

export default function BillingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const isPro = useBusinessStore((s) => s.isPro);
  const business = useBusinessStore((s) => s.business);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-billing-modal', handleOpen);
    return () => window.removeEventListener('open-billing-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  const whatsappNumber = '573143243707'; // User requested this exact number
  const message = `Hola! Quiero activar mi Plan PRO en CAMLY. Mi ID de tienda es: ${business?.id}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
         {/* Banner */}
         <div className="bg-dark p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/30 rounded-full blur-[40px]" />
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={16} />
            </button>
            <div className="relative z-10 space-y-3">
               <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-brand/20 mb-4">
                 <Sparkles size={24} />
               </div>
               <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                 Desbloquea Todo Tu Potencial
               </h2>
               <p className="text-white/60 text-sm font-medium">Asume el control total de tus ventas por solo $15 / mes.</p>
            </div>
         </div>

         <div className="p-8">
            <ul className="space-y-4 mb-8">
               {[
                 'Personalización total con tu identidad visual',
                 'Estadísticas gráficas visuales y métricas',
                 'Gestión avanzada del equipo de domiciliarios'
               ].map((feat, i) => (
                 <li key={i} className="flex items-start gap-4 text-sm font-bold text-dark">
                    <CheckCircle2 size={18} className="text-brand shrink-0 mt-0.5" />
                    {feat}
                 </li>
               ))}
            </ul>

            <div className="bg-bg-alt/50 border border-border rounded-3xl p-6 text-center space-y-4">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Inversión Mensual</p>
                 <p className="text-4xl font-black text-dark tracking-tighter leading-none">$15 <span className="text-sm text-muted">USD</span></p>
               </div>
               <p className="text-xs font-bold text-dark/70 pt-2 border-t border-border/50">
                 Transfiere exactamente <span className="text-brand font-black">60.000 COP</span> a <br/>
                 <span className="font-black text-dark text-lg">NEQUI: 3143243707</span>
               </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
               <a 
                 href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
                 target="_blank" rel="noreferrer"
                 className="btn-primary w-full shadow-2xl flex items-center justify-center gap-2 relative overflow-hidden group hover:scale-105 transition-transform"
               >
                 <span className="relative z-10 flex items-center gap-2">
                   ENVIAR COMPROBANTE AL ADMIN <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </span>
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               </a>
               <p className="text-[9px] font-bold text-muted text-center uppercase tracking-widest flex items-center justify-center gap-1 mt-2">
                 <ShieldCheck size={12} /> Activación instantánea y segura
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
