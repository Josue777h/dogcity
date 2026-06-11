import { Store, ShoppingBag, Package, Settings, LogOut, X, Bike, Sparkles, Tag } from 'lucide-react';
import { useBusinessStore } from '../../../stores';

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Store },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'products', label: 'Productos', icon: Package },
];

const MANAGE_TABS = [
  { id: 'categories', label: 'Categorías', icon: Tag },
  { id: 'drivers', label: 'Domiciliarios', icon: Bike },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, business, onSignOut, isOpen, onClose }) {
  const isPro = useBusinessStore(s => s.isPro);

  const renderTab = (tab) => (
    <button
      key={tab.id}
      onClick={() => {
        setActiveTab(tab.id);
        if (window.innerWidth < 1024) onClose();
      }}
      title={tab.label}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all relative group
        ${activeTab === tab.id 
          ? 'bg-brand/15 text-white' 
          : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      {activeTab === tab.id && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-full shadow-lg shadow-brand/50 transition-all" />
      )}
      <tab.icon size={20} className={activeTab === tab.id ? 'text-brand' : ''} />
      {tab.label}
    </button>
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[110] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 z-[120] flex flex-col 
        transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-[#1a2332] via-dark to-[#151c28]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand/5 via-transparent to-transparent pointer-events-none" />

        <div className="p-8 relative">
          <div className="flex items-center justify-between mb-10 lg:block">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/50 overflow-hidden border-2 border-white/10">
                  {business?.logo_url ? (
                    <img src={business.logo_url} className="w-full h-full object-contain p-1.5" alt={business.nombre_visible} loading="lazy" decoding="async" />
                  ) : (
                    <Store size={28} className="text-white" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-dark shadow-sm" title="En línea" />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-black tracking-tighter truncate uppercase leading-none text-white">
                  {business?.nombre_visible || 'ADMIN'}
                </h2>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Panel Control</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] px-4 mb-3">Principal</p>
            {MAIN_TABS.map(renderTab)}

            <div className="my-4 mx-4 border-t border-white/5" />

            <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] px-4 mb-3">Gestión</p>
            {MANAGE_TABS.map(renderTab)}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 relative">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-error/60 hover:bg-error/10 hover:text-error transition-all"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
          
          {!isPro && (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))}
              className="mt-6 w-full flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-tr from-brand to-accent shadow-xl shadow-brand/20 relative overflow-hidden group hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Sparkles size={24} className="text-white mb-2 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Prueba PRO Total</span>
              <span className="text-xs font-bold text-white/80">Desbloquear todo</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
