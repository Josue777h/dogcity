import { Lock, CreditCard, ChevronRight, Zap } from 'lucide-react';
import SaaSLogo from '../../../components/common/SaaSLogo';

export default function PlanExpiredView({ onOpenBilling }) {
  return (
    <div className="absolute inset-0 z-50 bg-bg-alt/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] border border-border shadow-2xl shadow-brand/10 max-w-lg w-full p-8 sm:p-12 text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-error/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-error/10 text-error rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="animate-pulse" />
          </div>

          <h2 className="text-3xl font-black text-dark tracking-tighter uppercase mb-3">
            TU PRUEBA <span className="text-error">TERMINÓ</span>
          </h2>
          
          <p className="text-sm font-medium text-muted mb-8 leading-relaxed">
            Se acabaron tus 7 días de prueba gratis. Activa el Plan Profesional para recuperar el acceso a tu tienda y seguir recibiendo pedidos por WhatsApp.
          </p>

          <div className="space-y-4">
            <button 
              onClick={onOpenBilling}
              className="w-full bg-dark text-white rounded-2xl py-4 px-6 font-black text-sm tracking-widest uppercase flex items-center justify-between hover:bg-dark/90 transition-all shadow-xl shadow-dark/20 group"
            >
              <span className="flex items-center gap-2"><CreditCard size={18} /> ACTIVAR PLAN PRO</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest pt-4">
              <Zap size={14} className="text-brand" /> Mismo link, sin perder datos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
