import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, Store, Clock, X, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { useBusinessStore, useCartStore, useToastStore } from '../../stores';
import Badge from '../../components/ui/Badge';
import { fetchBusiness, fetchProducts, fetchSubscription, fetchCategories } from '../../lib/supabase';
import { formatMoney, checkBusinessSchedule } from '../../lib/utils';
import ProductCard from './ProductCard';
import OrderDrawer from './OrderDrawer';
import StoreFooter from './components/StoreFooter';
import SEO from '../../components/common/SEO';

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const slug = useParams().slug || searchParams.get('negocio') || 'dogcity';

  const { business, products, categories, isLoading, setBusiness, setProducts, setCategories, setLoading, setError } = useBusinessStore();
  const bid = business?.id;

  const totalItems = useCartStore(s => s.getTotalItems(bid));
  const totalPrice = useCartStore(s => s.getTotalPrice(bid, products));
  const addToast   = useToastStore(s => s.addToast);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

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
    document.documentElement.style.setProperty('--color-brand', color);
    document.documentElement.style.setProperty('--color-brand-dark', color);
  }, [business?.theme_color]);

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
      card_style: 'standard'
    };
    if (typeof business?.footer_message === 'string' && business.footer_message.includes('CAMLY_DESIGN:')) {
      try {
        const match = business.footer_message.match(/<!--CAMLY_DESIGN:(.*?)-->/);
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div
          className="w-9 h-9 rounded-full border-2 border-slate-200 animate-spin"
          style={{ borderTopColor: 'var(--color-brand, #0284C7)' }}
        />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargando catálogo...</p>
      </div>
    );
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
      className="flex min-h-dvh flex-col bg-[#f7f6f2] text-slate-900"
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
      <header className="sticky top-0 z-[80] border-b border-[#e7e3db] bg-white pt-safe">
        <div className="fluid-container space-y-3 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} className="h-11 w-[4.5rem] shrink-0 object-contain object-left sm:h-12 sm:w-20" alt={`Logo de ${business.nombre_visible || business.nombre}`} fetchPriority="high" />
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
                style={{ backgroundColor: brandColor }}
              >
                <Store size={20} className="text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                {business?.nombre_visible || 'Menú Digital'}
              </h1>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <Badge variant={scheduleStatus.isOpen ? 'success' : 'warning'} className="shrink-0 px-1.5 py-0.5 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${scheduleStatus.isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {scheduleStatus.isOpen ? 'Abierto' : 'Cerrado'}
                </Badge>
                {business?.direccion && (
                  <span className="hidden truncate text-xs text-slate-500 sm:block">
                    {business.direccion}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className={`hidden items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors md:flex ${
                totalItems > 0
                  ? 'text-white border-transparent'
                  : 'border-[#e4e1da] bg-white text-slate-700 hover:bg-[#f7f6f2]'
              }`}
              style={totalItems > 0 ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={16} />
              <span className="text-sm font-semibold tabular-nums">Pedido{totalItems > 0 ? ` · ${totalItems}` : ''}</span>
            </button>
          </div>

          {/* Search in sticky header */}
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Buscar productos"
              className="h-11 w-full rounded-xl border border-[#d9d5cd] bg-[#f7f6f2] pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-black/5 hover:text-slate-800"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal category chips */}
        <nav aria-label="Categorías de productos" className="border-t border-[#f0ede7]">
          <div className="fluid-container">
            <div role="tablist" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 py-2.5 hide-scrollbar no-scrollbar">
              {visibleCategories.map(cat => {
                const isActive = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`min-h-10 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  isStoreOpen={scheduleStatus.isOpen}
                  storeClosedMessage={scheduleStatus.message}
                />
              ))}
            </div>
          )}

          {/* Desktop help strip */}
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
        </div>
        <StoreFooter business={business} hasFloatingCart={totalItems > 0} />
      </main>

      {/* Floating cart bar — tenant brand color */}
      {!drawerOpen && totalItems > 0 && (
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
              <span className="text-sm font-semibold truncate">Ver pedido</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm font-bold tabular-nums">{formatMoney(totalPrice)}</span>
              <ChevronRight size={16} className="opacity-80" />
            </div>
          </button>
        </div>
      )}

      <OrderDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} scheduleStatus={scheduleStatus} />
    </div>
  );
}
