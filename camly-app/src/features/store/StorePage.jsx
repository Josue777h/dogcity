import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, MessageCircle, Store, Clock, MapPin, Sparkles, X, ChevronRight, Phone } from 'lucide-react';
import { useBusinessStore, useCartStore, useToastStore } from '../../stores';
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

  // Apply brand color
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="w-10 h-10 rounded-full border-3 border-orange-200 border-t-orange-600 animate-spin" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Cargando catálogo...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] flex flex-col items-center justify-center p-6 text-center">
        <SEO 
          title="Tienda no encontrada | NEGU"
          description="El catálogo que buscas no existe o el enlace está incompleto."
          canonical={`https://negu.pro/${slug}`}
          noindex={true}
        />
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
          <Store size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Tienda no encontrada</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          El catálogo <strong className="text-gray-800">/{slug}</strong> no existe o el enlace está incompleto.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 hover:text-gray-950 font-bold px-5 py-2.5 rounded-full text-sm border border-gray-200 shadow-xs transition">
            Volver al inicio
          </Link>
          <Link to="/registro" className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold px-5 py-2.5 rounded-full text-sm border border-gray-800 transition">
            Crear mi propio catálogo gratis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={fontStyle}
      className="min-h-screen bg-gray-50 text-gray-900 selection:bg-orange-500 selection:text-white"
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
      
      {/* ── TOP NAV (Minimalista y Funcional) ── */}
      <nav className="sticky top-0 z-[80] bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-2xs pt-safe">
        <div className="fluid-container flex items-center justify-between gap-2.5 h-13 sm:h-14">
          
          {/* Logo limpio y destacado + nombre */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {business?.logo_url ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200/90 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <img 
                  src={business.logo_url} 
                  className="w-full h-full object-contain p-0.5" 
                  alt={business.nombre_visible} 
                  loading="lazy" 
                />
              </div>
            ) : (
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: brandColor }}
              >
                <Store size={18} className="text-white" />
              </div>
            )}
            <span className="text-xs sm:text-base font-black text-gray-950 truncate">
              {business?.nombre_visible || 'Menú Digital'}
            </span>
          </div>

          {/* Cart button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3.5 ${designConfig.button_radius || 'rounded-full'} border transition-all shadow-xs ${
                totalItems > 0
                  ? 'text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              style={totalItems > 0 ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={15} />
              <span className="text-xs sm:text-sm font-bold">
                {totalItems > 0 ? (
                  <span className="flex items-center gap-1">
                    <span>{totalItems}</span>
                    <span className="hidden sm:inline">· {formatMoney(totalPrice)}</span>
                  </span>
                ) : (
                  <span className="font-semibold text-xs sm:text-sm">Mi Pedido</span>
                )}
              </span>
            </button>
          </div>

        </div>
      </nav>

      {/* ── AVISO DE COMERCIO CERRADO O EN PAUSA ── */}
      {!scheduleStatus.isOpen && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-500/30 text-amber-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2.5 text-center shadow-2xs animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <Clock size={15} className="shrink-0 text-amber-700" />
          <span>
            <strong className="font-bold">Tienda en pausa o cerrada:</strong> {scheduleStatus.message}. El catálogo está en modo informativo y no recibe pedidos en este momento.
          </span>
        </div>
      )}

      {/* ── DETALLES DE LA TIENDA (INFORMACIÓN CLAVE SIN DUPLICAR) ── */}
      <section className="bg-white border-b border-gray-200/80">
        <div className="fluid-container py-2.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${
                scheduleStatus.isOpen 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scheduleStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {scheduleStatus.isOpen ? 'Abierto ahora' : 'Pausado'}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-500 truncate">
                {scheduleStatus.message}
              </span>
            </div>
            {business?.direccion && (
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                📍 {business.direccion}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 bg-gray-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200/70 self-start sm:self-auto">
            <span>⏱️ 30-45 min aprox.</span>
            <span>·</span>
            <span>📱 Pedidos a WhatsApp</span>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="pb-24 sm:pb-20 font-sans">
        <div className="fluid-container pt-3.5 sm:pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

            {/* ── LEFT: Categories Sidebar (Desktop) / Horizontal pills (Mobile) ── */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-20 space-y-3 sm:space-y-4">
                
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 shadow-2xs text-gray-900"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-2 hidden lg:block">
                    Categorías del Menú
                  </p>
                  
                  {/* Horizontal Scroll on Mobile / Vertical on Desktop */}
                  <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 hide-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                    {visibleCategories.map(cat => {
                      const isActive = currentCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCurrentCategory(cat)}
                          className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center lg:text-left shrink-0 cursor-pointer ${
                            isActive
                              ? 'text-white shadow-xs'
                              : 'bg-white lg:bg-transparent border lg:border-none border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                          style={isActive ? { backgroundColor: brandColor } : {}}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Info Box (Desktop) */}
                <div className="hidden lg:block card p-4 bg-white text-xs space-y-2 border-gray-200 border-l-2 border-l-orange-500">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <Clock size={15} className="text-orange-600" />
                    <span>Entrega estimada: 30–45 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageCircle size={15} className="text-emerald-600" />
                    <span>Pedidos directos a WhatsApp con GPS</span>
                  </div>
                </div>

              </div>
            </aside>

            {/* ── CENTER: Products Grid ── */}
            <section className="lg:col-span-6 space-y-4">
              
              {/* Active Filter Title */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">
                    {currentCategory === 'Todos' ? 'Todos los productos' : currentCategory}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {visible.length} producto{visible.length !== 1 ? 's' : ''} disponible{visible.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Grid */}
              {visible.length === 0 ? (
                <div className="card py-16 px-4 text-center bg-white border-dashed border-gray-300">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Search size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800">No encontramos productos</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    No hay productos que coincidan con "{searchTerm}" en esta categoría.
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setCurrentCategory('Todos'); }}
                    className="btn-secondary py-2 px-4 text-xs font-semibold mt-4"
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
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
            </section>

            {/* ── RIGHT: Order Summary Card (Desktop) ── */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 space-y-3">
                <div className="card bg-white border-gray-200/80 shadow-sm overflow-hidden">
                  
                  {/* Header */}
                  <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={16} className="text-orange-600" />
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Tu Pedido
                      </h3>
                    </div>
                    {totalItems > 0 && (
                      <span className="badge badge-success text-[10px]">
                        {totalItems} item{totalItems > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {totalItems === 0 ? (
                      <div className="text-center py-8 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                          <ShoppingCart size={20} />
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Tu canasta está vacía</p>
                        <p className="text-[11px] text-gray-400 max-w-[180px] mx-auto">
                          Selecciona los productos que deseas pedir para agregarlos.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {useCartStore.getState().getSelectedItems(bid, products).map(item => (
                            <div key={item.id} className="flex justify-between items-start gap-2 text-xs">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">
                                  <span className="text-orange-600 font-bold">{item.quantity}×</span> {item.name}
                                </p>
                              </div>
                              <span className="font-semibold text-gray-700 tabular-nums shrink-0">
                                {formatMoney(item.quantity * item.price)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-gray-100 space-y-3">
                          <div className="flex justify-between items-baseline text-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase">Subtotal</span>
                            <span className="text-lg font-black text-gray-900 tabular-nums">
                              {formatMoney(totalPrice)}
                            </span>
                          </div>

                          <button
                            onClick={() => setDrawerOpen(true)}
                            className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-md gap-1.5"
                          >
                            <MessageCircle size={15} />
                            <span>Confirmar pedido</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* WhatsApp Help badge */}
                <div className="p-3 bg-white card border-gray-200 text-xs flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 leading-tight">¿Preguntas sobre el menú?</p>
                    <a
                      href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      Escríbenos por WhatsApp
                    </a>
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </main>

      {/* ── MOBILE: Floating Cart Bar ── */}
      {!drawerOpen && totalItems > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-[90] animate-slide-up pb-safe">
          <button
            onClick={() => setDrawerOpen(true)}
            className={`w-full flex items-center justify-between p-3 ${
              designConfig.button_style === 'square'
                ? 'rounded-none uppercase tracking-wider font-black'
                : designConfig.button_style === 'soft'
                  ? 'rounded-xl font-bold'
                  : 'rounded-2xl font-bold'
            } shadow-lg text-white active:scale-[0.99] transition-transform`}
            style={{ backgroundColor: brandColor }}
          >
            <div className="flex items-center gap-2">
              <span className={`w-6.5 h-6.5 ${designConfig.button_style === 'square' ? 'rounded-none' : 'rounded-lg'} bg-white/25 flex items-center justify-center text-xs font-bold`}>
                {totalItems}
              </span>
              <span className="text-xs sm:text-sm">Ver mi pedido</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-extrabold tabular-nums">{formatMoney(totalPrice)}</span>
              <ChevronRight size={17} />
            </div>
          </button>
        </div>
      )}

      {/* Order Drawer and Footer */}
      <OrderDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} scheduleStatus={scheduleStatus} />
      <StoreFooter business={business} />

    </div>
  );
}
