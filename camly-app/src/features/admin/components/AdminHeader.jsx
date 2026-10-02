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

export default function AdminHeader({ title, business, onOpenMenu }) {
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
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-[80] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 pt-safe shadow-2xs">
      
      {/* Left: Mobile hamburger + Tab title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0 tap-target"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">
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
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Subscription Status Pill */}
        {isExpired ? (
          <span className="badge badge-error text-[11px]">
            <AlertTriangle size={11} /> Plan Vencido
          </span>
        ) : subscription?.estado === 'trial' ? (
          <span className="badge badge-warning text-[11px]">
            <Zap size={11} />
            Prueba · {trialDaysLeft}d
          </span>
        ) : isPro ? (
          <span className="badge badge-success text-[11px]">
            <Sparkles size={11} />
            Plan Pro{proDaysLeft !== null ? ` · ${proDaysLeft}d` : ''}
          </span>
        ) : null}

        {/* Store link actions */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
          <button
            onClick={copyLink}
            title="Copiar link de tienda para clientes"
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all tap-target flex items-center gap-1 text-xs font-semibold"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span className="hidden md:inline">{copied ? 'Copiado' : 'Copiar link'}</span>
          </button>
          
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all tap-target flex items-center gap-1 text-xs font-semibold"
            title="Ver catálogo público"
          >
            <span className="hidden sm:inline">Ver tienda</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs shrink-0"
          title={userEmail}
        >
          {userInitial}
        </div>

      </div>
    </header>
  );
}
