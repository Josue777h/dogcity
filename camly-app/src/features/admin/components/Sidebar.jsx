import { Store, ShoppingBag, Package, Settings, LogOut, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, business, onSignOut, isOpen, onClose }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Store },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[110] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-dark text-white z-[120] flex flex-col 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10 lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/50">
                <Store size={22} />
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-black tracking-tighter truncate uppercase leading-none">
                  {business?.nombre_visible || 'ADMIN'}
                </h2>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Panel Control</span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab.id 
                    ? 'bg-brand text-white shadow-xl shadow-brand/30 translate-x-1' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-error/60 hover:bg-error/10 hover:text-error transition-all"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
