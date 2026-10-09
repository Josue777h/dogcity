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
  }, [business?.footer_message]);

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
      className="min-h-screen bg-slate-50 text-slate-900"
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
      <header className="sticky top-0 z-[80] bg-white/95 backdrop-blur-md border-b border-slate-200/80 pt-safe">
        <div className="fluid-container py-2 sm:py-2.5 space-y-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {business?.logo_url ? (
              <img src={business.logo_url} className="h-12 w-20 shrink-0 object-contain object-left sm:h-14 sm:w-24" alt={`Logo de ${business.nombre_visible || business.nombre}`} fetchPriority="high" />
            ) : (
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                <Store size={22} className="text-white" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
                {business?.nombre_visible || 'Menú Digital'}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={scheduleStatus.isOpen ? 'success' : 'warning'} className="px-1.5 py-0.5 text-[10px] sm:text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${scheduleStatus.isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {scheduleStatus.isOpen ? 'Abierto' : 'Cerrado'}
                </Badge>
                {business?.direccion && (
                  <span className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden xs:inline sm:inline">
                    {business.direccion}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 ${designConfig.button_radius || 'rounded-full'} border transition-colors shrink-0 ${
                totalItems > 0
                  ? 'text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              style={totalItems > 0 ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={15} />
              <span className="text-xs font-semibold tabular-nums">
                {totalItems > 0 ? totalItems : 'Pedido'}
              </span>
            </button>
          </div>

          {/* Search in sticky header */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5 text-slate-900 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal category chips */}
        <div className="border-t border-slate-100">
          <div className="fluid-container">
            <div className="flex gap-1.5 overflow-x-auto py-1.5 hide-scrollbar no-scrollbar -mx-1 px-1">
              {visibleCategories.map(cat => {
                const isActive = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCurrentCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                      isActive
                        ? 'text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: brandColor } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
      <main className={totalItems > 0 ? 'pb-24 sm:pb-20' : 'pb-4'}>
        <div className="fluid-container pt-3 sm:pt-4">
          <div className="flex items-baseline justify-between gap-2 mb-3 px-0.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentCategory === 'Todos' ? 'Todos los productos' : currentCategory}
            </h2>
            <p className="text-xs text-slate-500 tabular-nums shrink-0">
              {visible.length} producto{visible.length !== 1 ? 's' : ''}
            </p>
          </div>

          {visible.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white border border-dashed border-slate-200 rounded-xl">
              <div className="w-11 h-11 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No encontramos productos</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No hay productos que coincidan con &quot;{searchTerm}&quot; en esta categoría.
              </p>
              <button
                onClick={() => { setSearchTerm(''); setCurrentCategory('Todos'); }}
                className="mt-4 text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-2"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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
          <div className="hidden sm:flex mt-5 items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
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
      </main>

      {/* Floating cart bar — tenant brand color */}
      {!drawerOpen && totalItems > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-[90] animate-slide-up pb-safe max-w-lg mx-auto">
          <button
            onClick={() => setDrawerOpen(true)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-white active:scale-[0.99] transition-transform ${
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
      <StoreFooter business={business} />
    </div>
  );
}
