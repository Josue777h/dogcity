import { Store, ShoppingBag, Package, Settings, LogOut, X, Bike, Sparkles, Tag, DollarSign, ExternalLink } from 'lucide-react';
import { useBusinessStore } from '../../../stores';
import SaaSLogo from '../../../components/common/SaaSLogo';

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Store },
  { id: 'orders',   label: 'Pedidos en vivo', icon: ShoppingBag },
  { id: 'revenue',  label: 'Ingresos y ventas', icon: DollarSign },
  { id: 'products', label: 'Productos', icon: Package },
];

const MANAGE_TABS = [
  { id: 'categories', label: 'Categorías', icon: Tag },
  { id: 'drivers',    label: 'Domiciliarios', icon: Bike },
  { id: 'settings',   label: 'Configuración', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, business, onSignOut, isOpen, onClose }) {
  const isPro = useBusinessStore(s => s.isPro);
  const storeUrl = `/${business?.nombre || ''}`;

  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => { setActiveTab(tab.id); if (window.innerWidth < 1024) onClose(); }}
        title={tab.label}
        className={`sidebar-item flex items-center justify-between w-full py-2.5 px-3 rounded-xl transition-all text-xs font-semibold ${
          isActive 
            ? 'active bg-white/10 text-white font-bold' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <tab.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
          <span>{tab.label}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 w-64 z-[120] flex flex-col bg-gray-950 text-white border-r border-gray-800/80
          transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand / Logo */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-800/70">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs"
              style={{ backgroundColor: business?.theme_color || '#EA580C' }}
            >
              {business?.logo_url ? (
                <img src={business.logo_url} className="w-full h-full object-contain p-1" alt={business.nombre_visible} />
              ) : (
                <Store size={18} className="text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {business?.nombre_visible || 'Mi Negocio'}
              </p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
            Principal
          </p>
          {MAIN_TABS.map(renderTab)}

          <div className="my-4 mx-2 border-t border-gray-800/70" />

          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
            Gestión
          </p>
          {MANAGE_TABS.map(renderTab)}
        </nav>

        {/* Store Link & Plan Upgrade */}
        <div className="p-3 border-t border-gray-800/70 space-y-2">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>Ver mi tienda online</span>
            <ExternalLink size={14} />
          </a>

          {!isPro && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))}
              className="btn-primary w-full py-2.5 px-3 text-xs font-semibold justify-center shadow-xs"
            >
              <Sparkles size={14} />
              <span>Activar Plan Pro</span>
            </button>
          )}

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
