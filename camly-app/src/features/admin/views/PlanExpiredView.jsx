import { Lock, CreditCard, ChevronRight } from 'lucide-react';

export default function PlanExpiredView({ onOpenBilling }) {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6 sm:p-8 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center mx-auto mb-4">
          <Lock size={22} />
        </div>

        <h2 className="text-xl font-bold text-slate-950 tracking-tight mb-2">
          Tu periodo de prueba finalizó
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          Tu catálogo, productos y configuración siguen guardados. Activa el Plan Pro para continuar recibiendo pedidos.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onOpenBilling}
            className="btn-primary w-full rounded-xl py-3 px-5 font-semibold text-xs sm:text-sm justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>Activar Plan Pro</span>
            </span>
            <ChevronRight size={16} />
          </button>

          <p className="text-[11px] font-medium text-slate-500">
            Mismo enlace de tienda, sin perder datos ni historial
          </p>
        </div>
      </div>
    </div>
  );
}
