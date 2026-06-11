import { Copy, ExternalLink, Menu, Zap, AlertTriangle, CheckCircle2, Search, Bell, ChevronRight, Sparkles } from 'lucide-react';
import { useToastStore, useBusinessStore, useAuthStore } from '../../../stores';

const TAB_LABELS = {
  dashboard: 'Dashboard',
  orders: 'Pedidos',
  products: 'Productos',
  categories: 'Categorías',
  drivers: 'Domiciliarios',
  settings: 'Configuración',
};

export default function AdminHeader({ title, business, onOpenMenu }) {
  const addToast = useToastStore(s => s.addToast);
  const session = useAuthStore(s => s.session);
  const { isPro, isExpired, trialDaysLeft, subscription } = useBusinessStore();
  const storeUrl = `${window.location.origin}/${business?.nombre}`;

  const getProDaysLeft = () => {
    if (!subscription || !subscription.fecha_fin || subscription.estado === 'trial') return null;
    const diff = new Date(subscription.fecha_fin) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const proDaysLeft = getProDaysLeft();
  const tabLabel = TAB_LABELS[title] || title;
  const userEmail = session?.user?.email || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || 'U';

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    addToast('Link copiado al portapapeles', 'success');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-[80] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 pt-safe">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={onOpenMenu}
          className="lg:hidden p-2 bg-bg-alt text-dark rounded-lg hover:bg-border transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-widest">
            <span className="truncate">{business?.nombre_visible}</span>
            <ChevronRight size={10} className="shrink-0" />
            <span className="text-brand truncate">{tabLabel}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tight truncate">
            {tabLabel}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search placeholder */}
        <div className="hidden lg:flex items-center gap-2 bg-bg-alt border border-border rounded-xl px-3 py-2 w-48">
          <Search size={14} className="text-muted shrink-0" />
          <span className="text-[11px] text-muted/60 font-medium">Buscar...</span>
        </div>

        {/* Plan badge — visible en todos los tamaños */}
        <div className="flex shrink-0">
          {isExpired ? (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-error/10 text-error rounded-lg border border-error/20">
              <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Vencido</span>
            </div>
          ) : subscription?.estado === 'trial' ? (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-500/10 text-orange-600 rounded-lg border border-orange-500/20">
              <Zap size={12} className="fill-orange-600 sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{trialDaysLeft}d</span>
            </div>
          ) : isPro ? (
            <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-success/10 text-success rounded-lg border border-success/20 relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_infinite] hidden sm:block" style={{ backgroundSize: '200% 100%' }} />
              <Sparkles size={12} className="relative sm:w-3.5 sm:h-3.5" />
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest relative whitespace-nowrap">
                Pro{proDaysLeft !== null ? ` ${proDaysLeft}d` : ''}
              </span>
            </div>
          ) : null}
        </div>

        {/* Notifications placeholder */}
        <button className="hidden sm:flex relative p-2.5 bg-bg-alt border border-border rounded-xl text-muted hover:text-dark hover:border-brand/30 transition-all" title="Notificaciones">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white" />
        </button>
        
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

        {/* User avatar */}
        <div className="hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent items-center justify-center text-white text-sm font-black shadow-md shadow-brand/20" title={userEmail}>
          {userInitial}
        </div>
      </div>
    </header>
  );
}
