import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, Store, Clock, X, ChevronRight, Phone, MessageCircle, Bell, Utensils } from 'lucide-react';
import { useBusinessStore, useCartStore, useToastStore } from '../../stores';
import Badge from '../../components/ui/Badge';
import { fetchBusiness, fetchProducts, fetchSubscription, fetchCategories } from '../../lib/supabase';
import { formatMoney, checkBusinessSchedule } from '../../lib/utils';
import ProductCard from './ProductCard';
import OrderDrawer from './OrderDrawer';
import StoreFooter from './components/StoreFooter';
import SEO from '../../components/common/SEO';
import PageLoading from '../../components/common/PageLoading';

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const slug = useParams().slug || searchParams.get('negocio') || '';
  const rawMesa = 
    searchParams.get('mesa') || 
    searchParams.get('Mesa') || 
    searchParams.get('MESA') || 
    searchParams.get('table') || 
    searchParams.get('m') || 
    '';

  const mesaParam = useMemo(() => {
    if (rawMesa) {
      try { sessionStorage.setItem(`negu_mesa_${slug || 'active'}`, rawMesa); } catch (_) {}
      return rawMesa;
    }
    try {
      return sessionStorage.getItem(`negu_mesa_${slug || 'active'}`) || '';
    } catch (_) {
      return '';
    }
  }, [rawMesa, slug]);

  const { business, products, categories, isLoading, setBusiness, setProducts, setCategories, setLoading, setError } = useBusinessStore();
  const bid = business?.id;

  const totalItems = useCartStore(s => s.getTotalItems(bid));
  const totalPrice = useCartStore(s => s.getTotalPrice(bid, products));
  const addToast   = useToastStore(s => s.addToast);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [waiterCalledCooldown, setWaiterCalledCooldown] = useState(0);

  const handleCallWaiter = () => {
    if (waiterCalledCooldown > 0) return;
    setWaiterCalledCooldown(45);

    const eventPayload = {
      type: 'CALL_WAITER',
      mesa: mesaParam,
      businessId: bid,
      timestamp: Date.now()
    };

    // 1. Notificación instantánea por BroadcastChannel entre pestañas / meseros
    try {
      const bc = new BroadcastChannel('negu_orders_channel');
      bc.postMessage(eventPayload);
      setTimeout(() => bc.close(), 1000);
    } catch (_) {}

    // 2. Evento en localStorage para sincronización entre ventanas
    try {
      localStorage.setItem('negu_table_call_event', JSON.stringify(eventPayload));
    } catch (_) {}

    addToast(`Mesero avisado para la Mesa #${mesaParam}. En breve se acercarán a atenderte.`, 'success');
  };

  useEffect(() => {
    if (waiterCalledCooldown <= 0) return;
    const timer = setInterval(() => {
      setWaiterCalledCooldown(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [waiterCalledCooldown]);

  // Escuchar cuando el mesero atiende la mesa para resetear la llamada
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('negu_orders_channel');
      bc.onmessage = (msg) => {
        if (msg?.data?.type === 'RESOLVE_WAITER_CALL' && String(msg.data.mesa) === String(mesaParam)) {
          setWaiterCalledCooldown(0);
          try { localStorage.removeItem('negu_table_call_event'); } catch (_) {}
          addToast(`Mesa #${mesaParam} atendida por el mesero`, 'info');
        }
      };
    } catch (_) {}

    return () => {
      if (bc) bc.close();
    };
  }, [mesaParam, addToast]);

  const scheduleStatus = useMemo(() => checkBusinessSchedule(business), [business]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const biz = await fetchBusiness(slug);
        if (biz) {
          const [prods, sub, cats] = await Promise.all([
            fetchProducts(biz.id).catch(e => { console.warn('Prods load error:', e); return []; }),
            fetchSubscription ? fetchSubscription(biz.id).catch(() => null) : Promise.resolve(null),
            fetchCategories ? fetchCategories(biz.id).catch(() => []) : Promise.resolve([]),
          ]);
          setBusiness(biz, sub);
          setProducts(prods || []);
          setCategories(cats || []);
        } else {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Store load error:', err);
        setError(err.message);
        addToast('No pudimos conectar con la tienda', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  // Apply brand color — tenant theming (do not remove)
  useEffect(() => {
    const color = business?.theme_color || '#0284C7';
    const secondaryColor = business?.color_secundario || '#FFF7ED';
    document.documentElement.style.setProperty('--color-brand', color);
    document.documentElement.style.setProperty('--color-brand-dark', color);
    document.documentElement.style.setProperty('--color-brand-secondary', secondaryColor);
  }, [business?.theme_color, business?.color_secundario]);

  const visibleCategories = useMemo(() => {
    if (categories?.length > 0) {
      const sorted = [...categories].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(c => c.nombre);
      return ['Todos', ...sorted];
    }
    const cats = [...new Set(products.map(p => p.categoria).filter(Boolean))].sort();
    return ['Todos', ...cats];
  }, [categories, products]);

  const visible = useMemo(() => {
    return products.filter(p => {
      if (!p.disponible) return false;
      let pCatName = p.categoria;
      if (p.categoria_id && categories?.length > 0) {
        const found = categories.find(c => c.id === p.categoria_id);
        if (found) pCatName = found.nombre;
      }
      const matchesCat    = currentCategory === 'Todos' || (pCatName || '').trim() === currentCategory.trim();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, currentCategory, searchTerm, categories]);

  const brandColor = business?.theme_color || '#EA580C';

  const designConfig = useMemo(() => {
    const base = {
      button_style: 'pill',
      button_radius: 'rounded-full',
      font_family: 'sans',
      card_style: 'standard',
      footer_style: 'branded'
    };
    if (business?.catalog_design && typeof business.catalog_design === 'object' && Object.keys(business.catalog_design).length) {
      const parsed = business.catalog_design;
      let radius = 'rounded-full';
      if (parsed.button_style === 'square') radius = 'rounded-none';
      else if (parsed.button_style === 'soft') radius = 'rounded-md';
      else if (parsed.button_style === 'outline') radius = 'rounded-lg';
      return { ...base, ...parsed, button_radius: radius };
    }
    if (typeof business?.footer_message === 'string' && /<!--(?:NEGU|CAMLY)_DESIGN:/.test(business.footer_message)) {
      try {
        const match = business.footer_message.match(/<!--(?:NEGU|CAMLY)_DESIGN:(.*?)-->/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          let radius = 'rounded-full';
          if (parsed.button_style === 'square') radius = 'rounded-none';
          else if (parsed.button_style === 'soft') radius = 'rounded-md';
          else if (parsed.button_style === 'outline') radius = 'rounded-lg';
          return { ...base, ...parsed, button_radius: radius };
        }
      } catch (err) {
        console.warn('Error parsing design config:', err);
      }
    }
    return base;
  }, [business]);

  const fontStyle = useMemo(() => {
    switch (designConfig.font_family) {
      case 'jakarta': return { fontFamily: "'Plus Jakarta Sans', sans-serif" };
      case 'outfit': return { fontFamily: "'Outfit', sans-serif" };
      case 'poppins': return { fontFamily: "'Poppins', sans-serif" };
      default: return { fontFamily: "'Inter', sans-serif" };
    }
  }, [designConfig.font_family]);

  if (isLoading) {
    return <PageLoading label="Cargando catálogo" />;
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <SEO
          title="Tienda no encontrada | NEGU"
          description="El catálogo que buscas no existe o el enlace está incompleto."
          canonical={`https://negu.pro/${slug}`}
          noindex={true}
        />
        <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4 border border-slate-200">
          <Store size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Tienda no encontrada</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          El catálogo <strong className="text-slate-800">/{slug}</strong> no existe o el enlace está incompleto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 hover:text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm border border-slate-200 transition">
            Volver al inicio
          </Link>
          <Link to="/registro" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            Crear mi propio catálogo gratis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={fontStyle}
      className="flex min-h-dvh flex-col bg-[#f7f6f2] text-slate-900 w-full max-w-full overflow-x-hidden"
    >
      <SEO
        title={`${business.nombre_visible || business.nombre} | Menú digital en NEGU`}
        description={business.descripcion || `Explora el catálogo interactivo de ${business.nombre_visible || business.nombre}. Haz tu pedido para domicilio con GPS o recogida en local por WhatsApp.`}
        canonical={`https://negu.pro/${slug}`}
        ogImage={business.logo_url || 'https://negu.pro/og-image.png'}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": business.nombre_visible || business.nombre,
          "url": `https://negu.pro/${slug}`,
          "image": business.logo_url || "https://negu.pro/og-image.png",
          "description": business.descripcion || "Menú digital interactivo en NEGU",
          ...(business.direccion ? { "address": { "@type": "PostalAddress", "streetAddress": business.direccion } } : {})
        }}
      />

      {/* ── Sticky header: logo, name, open/closed, search ── */}
      <header className="sticky top-0 z-[80] border-b border-[#e7e3db] bg-white pt-safe shadow-2xs w-full max-w-full">
        <div className="fluid-container py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4 min-w-0">
            
            {/* Izquierda: Marca (Logo + Nombre + Estado) */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {business?.logo_url ? (
                <img
                  src={business.logo_url}
                  className="h-9 w-auto max-w-[3.5rem] sm:h-12 sm:max-w-[6.5rem] md:h-13 md:max-w-[8rem] shrink-0 object-contain object-left"
                  alt={`Logo de ${business.nombre_visible || business.nombre}`}
                  fetchPriority="high"
                />
              ) : (
                <div
                  className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-bold"
                  style={{ backgroundColor: brandColor }}
                >
                  <Store size={18} className="text-white" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="truncate text-sm sm:text-base md:text-lg font-bold leading-tight text-slate-900">
                    {business?.nombre_visible || 'Menú Digital'}
                  </h1>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${scheduleStatus.isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    title={scheduleStatus.isOpen ? 'Abierto' : 'Cerrado'}
                  />
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {business?.descripcion || 'Catálogo interactivo'}
                </p>
              </div>
            </div>

            {/* Centro (Desktop): Barra de búsqueda integrada estilo OlaClick / Fudo */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-3 lg:mx-6 relative">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos en el menú..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Buscar productos"
                className="h-10 w-full rounded-xl border border-[#d9d5cd] bg-[#f7f6f2] pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-black/5 hover:text-slate-800"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Derecha: Botón de Llamar al Mesero (Mesa) o Carrito / Pedido (Online) */}
            <div className="flex items-center gap-2 shrink-0">
              {mesaParam ? (
                <button
                  type="button"
                  onClick={handleCallWaiter}
                  disabled={waiterCalledCooldown > 0}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 transition-all text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer ${
                    waiterCalledCooldown > 0
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 active:scale-95'
                  }`}
                  aria-label="Llamar al mesero"
                >
                  <Bell size={15} className={waiterCalledCooldown > 0 ? 'animate-pulse' : ''} />
                  <span>{waiterCalledCooldown > 0 ? `Mesero avisado (${waiterCalledCooldown}s)` : 'Llamar al mesero'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className={`flex items-center gap-2 rounded-xl border px-3 sm:px-4 py-2 sm:py-2.5 transition-all text-xs sm:text-sm font-bold shadow-2xs cursor-pointer ${
                    totalItems > 0
                      ? 'text-white border-transparent'
                      : 'border-[#e4e1da] bg-white text-slate-700 hover:bg-[#f7f6f2]'
                  }`}
                  style={totalItems > 0 ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                  aria-label="Abrir pedido"
                >
                  <ShoppingCart size={16} />
                  <span>
                    <span className="hidden sm:inline">Ver </span>Pedido
                    {totalItems > 0 ? ` (${totalItems})` : ''}
                  </span>
                </button>
              )}
            </div>

          </div>

          {/* Móvil: Búsqueda abajo de la cabecera */}
          <div className="relative md:hidden mt-2.5">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Buscar productos"
              className="h-9.5 w-full rounded-xl border border-[#d9d5cd] bg-[#f7f6f2] pl-10 pr-9 text-xs text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-black/5 hover:text-slate-800"
                aria-label="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal category chips */}
        <nav aria-label="Categorías de productos" className="border-t border-[#f0ede7] bg-[#faf9f6]/60">
          <div className="fluid-container">
            <div role="tablist" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 py-2 hide-scrollbar no-scrollbar items-center">
              {visibleCategories.map(cat => {
                const isActive = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    style={isActive ? { backgroundColor: brandColor, borderColor: brandColor, color: '#ffffff' } : {}}
                    className={`min-h-8.5 shrink-0 snap-start whitespace-nowrap rounded-full border px-3.5 py-1 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'text-white shadow-xs'
                        : 'border-[#d9d5cd] bg-white text-slate-700 hover:border-slate-400 hover:bg-[#f7f6f2]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Franja de Servicio en Mesa (Carta Digital) */}
      {mesaParam && (
        <aside
          aria-label="Mesa asignada"
          className="bg-white border-b border-[#e7e3db] px-3.5 sm:px-4 py-2 flex items-center justify-between text-xs w-full max-w-full"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-700 shrink-0">
              <Utensils size={13} />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-900 shrink-0">Mesa {mesaParam}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium truncate">Carta digital interactiva</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline shrink-0">
            El mesero tomará tu orden directamente en tu mesa
          </span>
        </aside>
      )}

      {/* Closed / paused banner */}
      {!scheduleStatus.isOpen && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 text-center">
          <Clock size={14} className="shrink-0 text-amber-700" />
          <span>
            <strong className="font-semibold">Tienda en pausa:</strong> {scheduleStatus.message}
          </span>
        </div>
      )}

      {/* Main catalog */}
      <main className="flex flex-1 flex-col">
        <div className="fluid-container flex-1 pb-6 pt-4 sm:pb-8 sm:pt-6">
          <div className="mb-3 flex items-center justify-between gap-2 px-0.5 sm:mb-4">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
              {currentCategory === 'Todos' ? 'Productos' : currentCategory}
            </h2>
            <p className="shrink-0 text-xs tabular-nums text-slate-500">
              {visible.length} producto{visible.length !== 1 ? 's' : ''}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d9d5cd] bg-white px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f0eb] text-slate-500">
                <Search size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No encontramos productos</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No hay productos que coincidan con &quot;{searchTerm}&quot; en esta categoría.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setCurrentCategory('Todos'); }}
                className="mt-4 min-h-10 rounded-lg px-3 text-sm font-semibold text-slate-800 underline underline-offset-2 hover:text-black"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
              {visible.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  isStoreOpen={scheduleStatus.isOpen}
                  storeClosedMessage={scheduleStatus.message}
                  isTableMode={Boolean(mesaParam)}
                />
              ))}
            </div>
          )}

          {/* Desktop help strip */}
          {!mesaParam && (
            <div className="mt-6 hidden items-center justify-between gap-4 rounded-xl border border-[#e4e1da] bg-white px-4 py-3 sm:flex">
              <div className="flex items-center gap-2.5 text-xs text-slate-600">
                <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                <span>Pedido directo a la tienda · Entrega o recogida según disponibilidad</span>
              </div>
              <a
                href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Phone size={13} />
                Preguntar
              </a>
            </div>
          )}
        </div>
        <StoreFooter business={business} hasFloatingCart={!mesaParam && totalItems > 0} />
      </main>

      {/* Botón flotante para llamar al mesero en móvil (Mesa) o Carrito flotante (Online) */}
      {mesaParam ? (
        <div className="fixed bottom-4 right-4 z-40 md:hidden animate-slide-up pb-safe">
          <button
            type="button"
            onClick={handleCallWaiter}
            disabled={waiterCalledCooldown > 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer ${
              waiterCalledCooldown > 0
                ? 'bg-emerald-600 text-white shadow-emerald-900/20'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/25'
            }`}
          >
            <Bell size={14} className={waiterCalledCooldown > 0 ? 'animate-pulse' : ''} />
            <span>{waiterCalledCooldown > 0 ? `Mesero avisado (${waiterCalledCooldown}s)` : 'Llamar al mesero'}</span>
          </button>
        </div>
      ) : (
        !drawerOpen && totalItems > 0 && (
          <div className="fixed bottom-3 left-3 right-3 z-[90] mx-auto max-w-lg animate-slide-up pb-safe md:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2.5 text-white shadow-lg shadow-black/10 transition-transform active:scale-[0.99] ${
                designConfig.button_style === 'square'
                  ? 'rounded-none'
                  : designConfig.button_style === 'soft'
                    ? 'rounded-lg'
                    : 'rounded-xl'
              }`}
              style={{ backgroundColor: brandColor }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold tabular-nums shrink-0">
                  {totalItems}
                </span>
                <span className="text-sm font-semibold truncate">
                  Ver pedido
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-bold tabular-nums">{formatMoney(totalPrice)}</span>
                <ChevronRight size={16} className="opacity-80" />
              </div>
            </button>
          </div>
        )
      )}

      {/* Drawer exclusivo para pedidos a domicilio o recogida */}
      {!mesaParam && (
        <OrderDrawer 
          isOpen={drawerOpen} 
          onClose={() => setDrawerOpen(false)} 
          scheduleStatus={scheduleStatus} 
          tableNumber=""
        />
      )}
    </div>
  );
}
