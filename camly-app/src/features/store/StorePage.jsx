import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, Search, MessageCircle, Store, Clock, MapPin, Sparkles, X, ChevronRight, Phone } from 'lucide-react';
import { useBusinessStore, useCartStore, useToastStore } from '../../stores';
import { fetchBusiness, fetchProducts, fetchSubscription, fetchCategories } from '../../lib/supabase';
import { formatMoney, checkBusinessSchedule } from '../../lib/utils';
import ProductCard from './ProductCard';
import OrderDrawer from './OrderDrawer';
import StoreFooter from './components/StoreFooter';

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
            fetchProducts(biz.id),
            fetchSubscription ? fetchSubscription(biz.id).catch(() => null) : Promise.resolve(null),
            fetchCategories ? fetchCategories(biz.id).catch(() => []) : Promise.resolve([]),
          ]);
          setBusiness(biz, sub);
          setProducts(prods || []);
          setCategories(cats || []);
        } else {
          setBusiness(null);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        addToast('No pudimos conectar con la tienda', 'error');
      }
    }
    load();
  }, [slug]);

  // Apply brand color
  useEffect(() => {
    const color = useBusinessStore.getState().isPro ? (business?.theme_color || '#EA580C') : '#EA580C';
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
          <Link to="/registro" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full text-sm shadow-glow-blue transition">
            Crear mi propio catálogo gratis
          </Link>
        </div>
      </div>
    );
  }

  const brandColor = business?.theme_color || '#EA580C';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-orange-500 selection:text-white">
      
      {/* ── TOP NAV ── */}
      <nav className="sticky top-0 z-[80] bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs pt-safe">
        <div className="fluid-container flex items-center justify-between gap-3 h-14 sm:h-16">
          
          {/* Business identity */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-black/5"
              style={{ backgroundColor: brandColor }}
            >
              {business?.logo_url ? (
                <img src={business.logo_url} className="w-full h-full object-contain p-1" alt={business.nombre_visible} loading="lazy" />
              ) : (
                <Store size={20} className="text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">
                {business?.nombre_visible || 'Tienda Digital'}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 truncate mt-0.5">
                <span className={`flex items-center gap-1 font-medium ${scheduleStatus.isOpen ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${scheduleStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {scheduleStatus.message || (scheduleStatus.isOpen ? 'Abierto ahora' : 'Cerrado ahora')}
                </span>
                {business?.direccion && (
                  <span className="hidden sm:inline-block truncate">
                    · {business.direccion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cart button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border transition-all shadow-xs tap-target ${
                totalItems > 0
                  ? 'bg-orange-600 border-orange-600 text-white shadow-orange-600/20'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={18} />
              <span className="text-xs sm:text-sm font-bold">
                {totalItems > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span>{totalItems}</span>
                    <span className="hidden sm:inline">· {formatMoney(totalPrice)}</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline font-semibold">Mi Pedido</span>
                )}
              </span>
            </button>
          </div>

        </div>
      </nav>

      {/* ── AVISO DE COMERCIO CERRADO ── */}
      {!scheduleStatus.isOpen && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-fade-in">
          <Clock size={14} className="shrink-0 text-amber-700" />
          <span>Comercio en pausa o cerrado: {scheduleStatus.message}. Puedes ver el menú pero no se están procesando pedidos.</span>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="pb-28 sm:pb-20">
        <div className="fluid-container pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT: Categories Sidebar (Desktop) / Horizontal pills (Mobile) ── */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-20 space-y-4">
                
                {/* Search Bar */}
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 shadow-2xs"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2 hidden lg:block">
                    Categorías
                  </p>
                  
                  {/* Horizontal Scroll on Mobile / Vertical on Desktop */}
                  <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {visibleCategories.map(cat => {
                      const isActive = currentCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCurrentCategory(cat)}
                          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-center lg:text-left shrink-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                            isActive
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-transparent text-gray-700 hover:bg-gray-200/60 hover:text-gray-900'
                          }`}
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                  {visible.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
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
        <div className="lg:hidden fixed bottom-safe left-3 right-3 z-[90] animate-slide-up">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl shadow-xl text-white bg-orange-600 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </span>
              <span className="text-sm font-bold">Ver mi pedido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tabular-nums">{formatMoney(totalPrice)}</span>
              <ChevronRight size={18} />
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
