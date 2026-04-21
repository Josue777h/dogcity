import { Lock } from 'lucide-react';
import { useBusinessStore } from '../../stores';

export default function PremiumLock({ children, featureName, compact = false }) {
  const isPro = useBusinessStore((s) => s.isPro);
  const subscription = useBusinessStore((s) => s.subscription);

  // If the user has a valid PRO subscription, just render the feature normally
  if (isPro) {
    return <>{children}</>;
  }

  // Handle the Upgrade action
  const handleUpgradeClick = () => {
    // We launch a custom event to open the Billing Modal globally (or navigate)
    window.dispatchEvent(new CustomEvent('open-billing-modal'));
  };

  return (
    <div className="relative group overflow-hidden rounded-[2rem]">
      {/* The original content, blurry and disabled */}
      <div className="opacity-40 blur-[2px] pointer-events-none select-none transition-all duration-500 group-hover:blur-[4px]">
        {children}
      </div>
      
      {/* The overlay lock */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-white/20 backdrop-blur-sm">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-dark mb-4 animate-bounce">
          <Lock size={24} />
        </div>
        
        {!compact && (
          <>
             <h4 className="text-xl font-black text-dark uppercase tracking-tight leading-none mb-2">
               FUNCIÓN PRO
             </h4>
             <p className="text-dark/70 text-xs font-bold leading-relaxed max-w-[200px] mb-6">
               Desbloquea {featureName} y muchas más herramientas para escalar tu operación.
             </p>
          </>
        )}
        
        <button 
           onClick={handleUpgradeClick}
           className="btn-primary !py-3 !px-6 !text-xs !bg-dark hover:!bg-brand transition-colors shadow-2xl shadow-dark/20"
        >
           MEJORAR PLAN
        </button>
      </div>
    </div>
  );
}
