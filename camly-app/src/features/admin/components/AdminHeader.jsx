import { Copy, ExternalLink, Menu, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToastStore, useBusinessStore } from '../../../stores';

export default function AdminHeader({ title, business, onOpenMenu }) {
  const addToast = useToastStore(s => s.addToast);
  const { isPro, isExpired, trialDaysLeft, subscription } = useBusinessStore();
  const storeUrl = `${window.location.origin}/${business?.nombre}`;

  const getProDaysLeft = () => {
    if (!subscription || !subscription.fecha_fin || subscription.estado === 'trial') return null;
    const diff = new Date(subscription.fecha_fin) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const proDaysLeft = getProDaysLeft();

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    addToast('Link copiado al portapapeles', 'success');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-[80] px-4 sm:px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="lg:hidden p-2 bg-bg-alt text-dark rounded-lg hover:bg-border transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] text-muted font-bold block sm:hidden uppercase tracking-widest mt-0.5">
            {business?.nombre_visible}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Tienda Activa</span>
          <span className="text-[11px] font-bold text-dark">{business?.nombre}.camly.app</span>
        </div>

        {/* BADGE DE ESTADO DE PLAN */}
        <div className="hidden md:flex ml-2 pr-2 border-r border-border">
          {isExpired ? (
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 text-error rounded-lg border border-error/20">
               <AlertTriangle size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">Plan Vencido</span>
             </div>
          ) : subscription?.estado === 'trial' ? (
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-600 rounded-lg border border-orange-500/20">
               <Zap size={14} className="fill-orange-600 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">Prueba: {trialDaysLeft} Días</span>
             </div>
          ) : isPro ? (
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-lg border border-success/20">
               <CheckCircle2 size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">
                 Plan Pro {proDaysLeft !== null ? `(${proDaysLeft} DÍAS)` : ''}
               </span>
             </div>
          ) : null}
        </div>
        
        <div className="flex items-center bg-bg-alt border border-border rounded-xl p-1 gap-1">
          <button 
            onClick={copyLink}
            title="Copiar link"
            className="p-2 text-muted hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
          >
            <Copy size={16} />
          </button>
          <a 
            href={`/${business?.nombre}`} 
            target="_blank" 
            rel="noreferrer"
            title="Abrir tienda"
            className="flex items-center gap-2 bg-brand text-white px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black transition-all hover:bg-brand/90 shadow-lg shadow-brand/20"
          >
            <span className="hidden sm:inline">VER TIENDA</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
