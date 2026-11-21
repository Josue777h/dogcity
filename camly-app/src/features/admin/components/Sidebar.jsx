import { NavLink } from 'react-router-dom';
import { Store, ShoppingBag, Package, Settings, LogOut, X, Bike, Zap, Tag, DollarSign, ExternalLink, Utensils, LayoutDashboard, Users } from 'lucide-react';
import { useBusinessStore } from '../../../stores';
import { isModuleEnabled } from '../../../lib/modules';

const MAIN_TABS = [
  { path: '/admin/dashboard',  label: 'Inicio', icon: LayoutDashboard, module: null },
  { path: '/admin/comandero',  label: 'Comandero', icon: Utensils, module: 'kitchen' },
  { path: '/admin/pedidos',    label: 'Pedidos en vivo', icon: ShoppingBag, module: 'orders' },
  { path: '/admin/clientes',   label: 'Clientes', icon: Users, module: 'loyalty' },
  { path: '/admin/ingresos',   label: 'Ingresos y ventas', icon: DollarSign, module: null },
  { path: '/admin/productos',  label: 'Productos', icon: Package, module: 'catalog' },
];

const MANAGE_TABS = [
  { path: '/admin/categorias',    label: 'Categorías', icon: Tag, module: 'catalog' },
  { path: '/admin/domiciliarios', label: 'Domiciliarios', icon: Bike, module: 'delivery' },
  { path: '/admin/configuracion', label: 'Configuración', icon: Settings, module: null },
];

export default function Sidebar({ business, onSignOut, isOpen, onClose }) {
  const isPro = useBusinessStore(s => s.isPro);
  const storeUrl = `/${business?.nombre || ''}`;

  const renderTab = (tab) => (
    <NavLink
      key={tab.path}
      to={tab.path}
      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
      className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
    >
      {({ isActive }) => (
        <>
          <tab.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{tab.label}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menú del panel"
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 w-[17rem] max-w-[85vw] lg:w-64 h-dvh max-h-dvh z-[120] flex flex-col bg-slate-950 text-white border-r border-white/5 shrink-0 select-none
          transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Negocio */}
        <div className="px-4 h-16 flex items-center justify-between gap-2 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {business?.logo_url ? (
              <img
                src={business.logo_url}
                className="w-10 h-10 rounded-xl object-contain bg-white/5 shrink-0"
                alt={business.nombre_visible || 'Logo del negocio'}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: business?.theme_color || '#0284C7' }}
              >
                <Store size={20} className="text-white" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {business?.nombre_visible || 'Mi Negocio'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto overscroll-y-contain hide-scrollbar">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 pb-1.5">Principal</p>
          {MAIN_TABS.filter(t => !t.module || isModuleEnabled(business, t.module)).map(renderTab)}

          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-5 pb-1.5">Gestión</p>
          {MANAGE_TABS.filter(t => !t.module || isModuleEnabled(business, t.module)).map(renderTab)}
        </nav>

        {/* Pie fijo */}
        <div className="p-3 border-t border-white/5 space-y-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 min-h-10 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span>Ver mi tienda online</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>

          {!isPro && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))}
              className="btn-primary w-full text-xs justify-center"
            >
              <Zap size={14} aria-hidden="true" />
              <span>Activar Plan Pro</span>
            </button>
          )}

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 min-h-10 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
