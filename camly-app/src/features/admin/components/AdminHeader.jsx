import { useState } from 'react';
import { Copy, ExternalLink, Menu, Zap, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { useToastStore, useBusinessStore, useAuthStore } from '../../../stores';

const TAB_LABELS = {
  dashboard:      'Dashboard General',
  orders:         'Gestión de Pedidos',
  pedidos:        'Gestión de Pedidos',
  products:       'Catálogo de Productos',
  productos:      'Catálogo de Productos',
  categories:     'Categorías del Menú',
  categorias:     'Categorías del Menú',
  drivers:        'Repartidores y Domicilios',
  domiciliarios:  'Repartidores y Domicilios',
  settings:       'Configuración de la Tienda',
  configuracion:  'Configuración de la Tienda',
  revenue:        'Reportes e Ingresos',
  ingresos:       'Reportes e Ingresos',
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
    <header className="sticky top-0 z-[80] bg-white border-b border-gray-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3">
        
        {/* Izquierda: Menú Hamburguesa + Título claro de sección */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenMenu}
            className="lg:hidden w-8.5 h-8.5 flex items-center justify-center rounded-lg text-gray-700 hover:text-gray-950 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight truncate leading-tight">
              {tabLabel}
            </h1>
            {business?.nombre_visible && (
              <p className="text-[11px] text-gray-500 truncate hidden sm:block">
                {business.nombre_visible} · {business.direccion || 'Tienda activa'}
              </p>
            )}
          </div>
        </div>

        {/* Derecha: Acciones limpias, proporcionales y organizadas */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Badge de prueba / Pro */}
          {isExpired ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0">
              <AlertTriangle size={12} className="shrink-0" />
              <span>Vencido</span>
            </span>
          ) : subscription?.estado === 'trial' ? (
            <span 
              className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0"
              title={`${trialDaysLeft} días de prueba restantes`}
            >
              <Zap size={11} className="shrink-0 text-amber-600" />
              <span>{trialDaysLeft}d <span className="hidden sm:inline">prueba</span></span>
            </span>
          ) : isPro ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0">
              <Sparkles size={11} className="shrink-0 text-emerald-600" />
              <span>Pro</span>
            </span>
          ) : null}

          {/* Acciones de tienda en Desktop / Tablet */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-50 p-0.5 rounded-lg border border-gray-200/70">
            <button
              type="button"
              onClick={copyLink}
              title="Copiar enlace de tu tienda"
              className="h-7.5 px-2 rounded-md hover:bg-white text-gray-700 hover:text-gray-900 flex items-center gap-1 text-[11px] font-medium transition-all"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copiado' : 'Copiar link'}</span>
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              title="Abrir catálogo público"
              className="h-7.5 px-2 rounded-md hover:bg-white text-gray-700 hover:text-gray-900 flex items-center gap-1 text-[11px] font-medium transition-all"
            >
              <ExternalLink size={13} />
              <span>Ver tienda</span>
            </a>
          </div>

          {/* En Móvil: Botón compacto para abrir tienda */}
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            title="Ver catálogo público"
            className="sm:hidden h-8 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center gap-1 text-xs font-semibold transition-colors shrink-0"
          >
            <span>Tienda</span>
            <ExternalLink size={12} />
          </a>

          {/* Movia (Asistente IA) */}
          <button
            type="button"
            onClick={onOpenAssistant}
            title="Consultar a Movia"
            className="h-8 px-2.5 rounded-lg bg-gray-900 hover:bg-black text-white font-medium flex items-center gap-1.5 text-xs transition-colors shrink-0"
          >
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span className="hidden xs:inline">Movia</span>
          </button>

          {/* Avatar del usuario */}
          <div
            className="w-8 h-8 rounded-lg bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0 select-none shadow-2xs"
            title={userEmail}
          >
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
