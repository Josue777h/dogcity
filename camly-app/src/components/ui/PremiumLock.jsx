import { Lock } from 'lucide-react';
import { useBusinessStore } from '../../stores';

export default function PremiumLock({ children, featureName, compact = false }) {
  const isPro = useBusinessStore((s) => s.isPro);

  if (isPro) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    window.dispatchEvent(new CustomEvent('open-billing-modal'));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="opacity-40 blur-[2px] pointer-events-none select-none">
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-white/80 backdrop-blur-xs">
        <div className={`w-full ${compact ? 'max-w-[260px] p-4' : 'max-w-xs p-5'} rounded-2xl border border-slate-200 bg-white text-center shadow-sm`}>
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
            <Lock size={18} />
          </div>

          {!compact && (
            <>
              <h4 className="text-sm font-bold text-slate-950 tracking-tight">
                Disponible en el Plan Pro
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1 mb-4">
                Activa {featureName} y todas las herramientas avanzadas para tu negocio.
              </p>
            </>
          )}

          <button
            type="button"
            onClick={handleUpgradeClick}
            className="btn-primary w-full py-2.5 px-4 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Activar Plan Pro
          </button>
        </div>
      </div>
    </div>
  );
}
