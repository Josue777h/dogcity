import { useState } from 'react';
import { Copy, ExternalLink, Menu, Zap, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { useToastStore, useBusinessStore, useAuthStore } from '../../../stores';

const TAB_LABELS = {
  dashboard:  'Dashboard General',
  orders:     'Gestión de Pedidos',
  products:   'Catálogo de Productos',
  categories: 'Categorías del Menú',
  drivers:    'Repartidores y Domicilios',
  settings:   'Configuración de la Tienda',
  revenue:    'Reportes e Ingresos',
};

export default function AdminHeader({ title, business, onOpenMenu, onOpenAssistant }) {
  const addToast  = useToastStore(s => s.addToast);
  const session   = useAuthStore(s => s.session);
  const { isPro, isExpired, trialDaysLeft, subscription } = useBusinessStore();
  const [copied, setCopied] = useState(false);

  const storeUrl  = `${window.location.origin}/${business?.nombre || ''}`;
  const tabLabel  = TAB_LABELS[title] || title;
  const userEmail = session?.user?.email || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || 'U';

  const proDaysLeft = (() => {
    if (!subscription?.fecha_fin || subscription.estado === 'trial') return null;
    const diff = new Date(subscription.fecha_fin) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    addToast('Enlace de la tienda copiado', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-[80] px-3 sm:px-6 lg:px-8 pt-3 pb-1 pt-safe bg-gradient-to-b from-[#F6F4EF] via-[#F6F4EF]/90 to-transparent">
    <header className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-full pl-2 pr-2 sm:pl-5 sm:pr-2.5 py-2 flex items-center justify-between gap-2 sm:gap-3 shadow-warm">
      
      {/* Left: Mobile hamburger + Tab title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:text-gray-950 bg-[#F6F4EF] hover:bg-gray-200/70 transition-colors shrink-0 tap-target"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-extrabold text-gray-950 tracking-tight truncate leading-tight">
            {tabLabel}
          </h1>
          {business?.nombre_visible && (
            <p className="text-[11px] text-gray-500 truncate hidden sm:block">
              {business.nombre_visible} · {business.direccion || 'Tienda activa'}
            </p>
          )}
        </div>
      </div>

      {/* Right: Plan badge + Store Actions + User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Subscription Status Pill */}
        {isExpired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200/80 text-[10px] sm:text-[11px] font-bold px-2.5 py-1">
            <AlertTriangle size={11} className="shrink-0" />
            <span className="hidden xs:inline">Plan Vencido</span>
          </span>
        ) : subscription?.estado === 'trial' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] sm:text-[11px] font-bold px-2.5 py-1">
            <Zap size={11} className="shrink-0" />
            <span>{trialDaysLeft}d</span>
            <span className="hidden sm:inline">prueba</span>
          </span>
        ) : isPro ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] sm:text-[11px] font-bold px-2.5 py-1">
            <Sparkles size={11} className="shrink-0" />
            <span>Pro</span>
            {proDaysLeft !== null && <span className="hidden sm:inline">· {proDaysLeft}d</span>}
          </span>
        ) : null}

        {/* Store link actions */}
        <div className="flex items-center gap-1 bg-[#F6F4EF] p-1 rounded-full border border-gray-200/60">
          <button
            onClick={copyLink}
            title="Copiar link de tienda para clientes"
            className="h-8 px-2 sm:px-3 rounded-full text-gray-600 hover:text-gray-950 hover:bg-white transition-all tap-target flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar link'}</span>
          </button>
          
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="h-8 px-2 sm:px-3 rounded-full text-gray-600 hover:text-gray-950 hover:bg-white transition-all tap-target flex items-center gap-1.5 text-xs font-semibold"
            title="Ver catálogo público"
          >
            <span className="hidden sm:inline">Ver tienda</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Movia */}
        <button
          type="button"
          onClick={onOpenAssistant}
          title="Consultar a Movia"
          className="h-8 px-3 rounded-full bg-gray-900 hover:bg-black text-white font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
        >
          <Sparkles size={12} className="text-gray-300" />
          <span>Movia</span>
        </button>

        {/* User Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-blue-50 shrink-0"
          title={userEmail}
        >
          {userInitial}
        </div>

      </div>
    </header>
    </div>
  );
}
