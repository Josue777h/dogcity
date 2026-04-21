import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Menu, X, Settings, Home, ShoppingBag, Info, Phone, MessageCircle, Clock, Search } from 'lucide-react';
import { useBusinessStore, useCartStore, useToastStore } from '../../stores';
import { fetchBusiness, fetchProducts, subscribeToProducts } from '../../lib/supabase';
import { formatMoney } from '../../lib/utils';
import ProductCard from './ProductCard';
import OrderDrawer from './OrderDrawer';
import StoreFooter from './components/StoreFooter';

export default function StorePage() {
  const [searchParams] = useSearchParams();
  const slug = useParams().slug || searchParams.get('negocio') || 'dogcity';

  const { business, products, isLoading, setBusiness, setProducts, setLoading, setError } = useBusinessStore();
  const bid = business?.id;
  
  const totalItems = useCartStore((s) => s.getTotalItems(bid));
  const totalPrice = useCartStore((s) => s.getTotalPrice(bid, products));
  const addToast = useToastStore((s) => s.addToast);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Load business + products
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const biz = await fetchBusiness(slug);
        setBusiness(biz);
        if (biz) {
          const prods = await fetchProducts(biz.id);
          setProducts(prods);
        }
      } catch (err) {
        setError(err.message);
        addToast('No pudimos conectar con la tienda', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();

    const sub = subscribeToProducts(async () => {
      const biz = useBusinessStore.getState().business;
      if (biz) {
        const prods = await fetchProducts(biz.id);
        setProducts(prods);
      }
    });

    return () => sub?.unsubscribe();
  }, [slug]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
    return ['Todos', ...cats];
  }, [products]);

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (!p.disponible) return false;
      const matchesCat = currentCategory === 'Todos' || (p.categoria || '').trim() === currentCategory.trim();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, currentCategory, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-sm font-bold text-muted animate-pulse uppercase tracking-widest">Cargando experiencia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── TOP NAV ────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-[80] border-b border-border">
        <div className="fluid-container h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 decoration-0">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <ShoppingBag size={22} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-dark uppercase tracking-tight leading-none">{business?.nombre_visible || 'CAMLY'}</h1>
              <span className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">SaaS de Pedidos</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 text-success bg-success/5 px-3 py-1.5 rounded-full border border-success/10">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Negocio Abierto</span>
            </div>
            
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-32">
        <div className="fluid-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ── LEFT COL: Categories (Sticky) ─────────────────── */}
            <aside className="lg:col-span-2 space-y-6">
              <div className="sticky top-24">
                <h3 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-4 pl-1">Categorías</h3>
                <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCurrentCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                        ${currentCategory === cat 
                          ? 'bg-brand text-white shadow-lg shadow-brand/20 translate-x-1' 
                          : 'bg-bg-alt text-dark hover:bg-border'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* ── CENTER COL: Products Grid ─────────────────────── */}
            <section className="lg:col-span-7 space-y-8">
              {/* Hero / Filter Bar */}
              <div className="premium-card !p-6 bg-gradient-to-br from-brand to-accent text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black italic tracking-tighter">¡EL MEJOR MENÚ!</h2>
                  <p className="text-white/70 text-sm font-medium mt-1 uppercase tracking-widest">Encuentra tus favoritos hoy mismo</p>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                   <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold outline-none placeholder:text-white/40 focus:bg-white/20 transition-all"
                   />
                </div>
              </div>

              {visible.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-bg-alt rounded-full flex items-center justify-center mx-auto text-muted">
                    <Search size={40} />
                  </div>
                  <h3 className="text-lg font-black text-dark">No hay resultados</h3>
                  <p className="text-sm text-muted">Intenta con otra categoría o término de búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visible.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>

            {/* ── RIGHT COL: Order Summary (Sticky Desktop) ─────── */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                <div className="premium-card !p-0">
                  <div className="bg-dark text-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ShoppingBag size={18} className="text-brand" />
                       <h3 className="font-black text-sm uppercase tracking-widest">Tu Pedido</h3>
                    </div>
                    <span className="bg-brand px-2 py-0.5 rounded text-[10px] font-black">{totalItems}</span>
                  </div>
                  
                  <div className="p-5 space-y-4 min-h-[300px] flex flex-col">
                    {totalItems === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                        <ShoppingBag size={48} className="mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Carrito vacío</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 space-y-3">
                          {useCartStore.getState().getSelectedItems(bid, products).map(item => (
                            <div key={item.id} className="flex justify-between items-start text-xs">
                              <span className="font-bold text-dark">{item.quantity}x {item.name}</span>
                              <span className="font-black text-muted">{formatMoney(item.quantity * item.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-muted uppercase tracking-widest">Total Estimado</span>
                            <span className="text-xl font-black text-brand tracking-tighter">{formatMoney(totalPrice)}</span>
                          </div>
                          <button onClick={() => setDrawerOpen(true)} className="w-full btn-primary !py-4">
                            CONTINUAR PEDIDO <MessageCircle size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="premium-card !p-4 bg-bg-alt border-dashed">
                  <div className="flex items-center gap-3 text-muted">
                    <Clock size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Entrega estimada: 30-45 min</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ── MOBILE BAR ─────────────────────────────────────── */}
      {!drawerOpen && totalItems > 0 && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-[90] animate-in fade-in slide-in-from-bottom-5 duration-500">
           <button 
            onClick={() => setDrawerOpen(true)}
            className="w-full bg-dark text-white p-2 rounded-2xl flex items-center justify-between shadow-2xl overflow-hidden active:scale-95 transition-transform"
           >
              <div className="bg-brand h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg">
                {totalItems}
              </div>
              <div className="flex-1 px-4 text-left">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Total Pedido</p>
                <p className="text-xl font-black tracking-tighter leading-none mt-1">{formatMoney(totalPrice)}</p>
              </div>
              <div className="bg-white/10 px-4 h-12 flex items-center rounded-xl text-xs font-black uppercase tracking-widest gap-2">
                REVISAR <ShoppingBag size={14} />
              </div>
           </button>
        </div>
      )}

      <OrderDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <StoreFooter business={business} />
    </div>
  );
}
