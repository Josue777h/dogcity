import { useState } from 'react';
import { Copy, ExternalLink, Menu, Zap, AlertTriangle, Check } from 'lucide-react';
import { useToastStore, useBusinessStore, useAuthStore } from '../../../stores';

const TAB_LABELS = {
  dashboard:      'Dashboard General',
  comandero:      'Comandero de Mesas',
  mesas:          'Comandero de Mesas',
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

const MOBILE_TAB_LABELS = {
  dashboard: 'Inicio',
  comandero: 'Comandero',
  mesas: 'Comandero',
  orders: 'Gestión',
  pedidos: 'Gestión',
  products: 'Productos',
  productos: 'Productos',
  categories: 'Categorías',
  categorias: 'Categorías',
  drivers: 'Repartidores',
  domiciliarios: 'Repartidores',
  settings: 'Ajustes',
  configuracion: 'Ajustes',
  revenue: 'Ingresos',
  ingresos: 'Ingresos',
};

export default function AdminHeader({ title, business, onOpenMenu }) {
  const addToast  = useToastStore(s => s.addToast);
  const session   = useAuthStore(s => s.session);
  const { isPro, isExpired, trialDaysLeft, subscription } = useBusinessStore();
  const [copied, setCopied] = useState(false);

  const storeUrl  = `${window.location.origin}/${business?.nombre || ''}`;
  const tabLabel  = TAB_LABELS[title] || title;
  const mobileTabLabel = MOBILE_TAB_LABELS[title] || tabLabel;
  const userEmail = session?.user?.email || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || 'U';

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    addToast('Enlace de la tienda copiado', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-[80] bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        
        {/* Izquierda: Menú Hamburguesa + Título claro de sección (nunca cortado) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onOpenMenu}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 aria-label={tabLabel} title={tabLabel} className="truncate font-display text-base sm:text-lg font-bold text-slate-950 tracking-tight leading-tight">
              <span className="sm:hidden">{mobileTabLabel}</span>
              <span className="hidden sm:inline">{tabLabel}</span>
            </h1>
            {business?.nombre_visible && (
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {business.nombre_visible} · {business.direccion || 'Tienda activa'}
              </p>
            )}
          </div>
        </div>

        {/* Derecha: Acciones limpias y sin saturar la barra móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Badge de prueba / Pro: solo en pantallas medianas+ para no recortar el título en móvil */}
          {isExpired ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 text-red-700 border border-red-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0">
              <AlertTriangle size={12} className="shrink-0" />
              <span>Vencido</span>
            </span>
          ) : subscription?.estado === 'trial' ? (
            <span 
              className="hidden md:inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0"
              title={`${trialDaysLeft} días de prueba restantes`}
            >
              <Zap size={11} className="shrink-0 text-amber-600" />
              <span>{trialDaysLeft}d prueba</span>
            </span>
          ) : isPro ? (
            <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold px-2 py-0.5 shrink-0">
              <Zap size={11} className="shrink-0 text-emerald-600" />
              <span>Pro</span>
            </span>
          ) : null}

          {/* Acciones de tienda en Desktop / Tablet */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={copyLink}
              title="Copiar enlace de tu tienda"
              className="h-8 px-2.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-950 flex items-center gap-1.5 text-xs font-medium transition-all"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copiado' : 'Copiar link'}</span>
            </button>

            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              title="Abrir catálogo público"
              className="h-8 px-2.5 rounded-md hover:bg-white text-slate-700 hover:text-slate-950 flex items-center gap-1.5 text-xs font-medium transition-all"
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
            aria-label="Ver catálogo público"
            className="sm:hidden h-10 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1 text-xs font-semibold transition-colors shrink-0"
          >
            <span>Tienda</span>
            <ExternalLink size={12} />
          </a>

          {/* Avatar del usuario (Desktop/Tablet) */}
          <div
            className="hidden sm:flex w-9 h-9 rounded-full bg-brand text-white text-sm font-bold items-center justify-center shrink-0 select-none"
            title={userEmail}
          >
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
}
