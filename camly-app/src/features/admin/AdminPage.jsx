import { useState, useEffect, lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store, Loader2, ChevronRight, LogOut, Bike, Sparkles } from 'lucide-react';
import { 
  getSupabase, 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  fetchOrders, 
  subscribeToOrders,
  fetchSubscription,
  fetchCategories
} from '../../lib/supabase';
import { playNewOrderSound } from '../../lib/utils';
import { useAuthStore, useToastStore, useBusinessStore } from '../../stores';

// Modular Components
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import ProductModal from './components/ProductModal';
import BillingModal from '../../components/ui/BillingModal';
import AiAssistantModal from './components/AiAssistantModal';
import SEO from '../../components/common/SEO';

const PlanExpiredView = lazy(() => import('./views/PlanExpiredView'));

function ViewLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-brand" size={32} />
    </div>
  );
}

export default function AdminPage() {
  const { session, setSession } = useAuthStore();
  const { business, setBusiness, isExpired, setCategories, setProducts: setGlobalProducts } = useBusinessStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener la subruta actual (ej. /admin/pedidos -> 'pedidos')
  const currentPathSegment = location.pathname.split('/')[2] || 'dashboard';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function loadInitial() {
      // In case session gets cleared mid-session
      if (!session) {
        setLoading(false);
        return;
      }
      await loadData(session.user.id);
    }
    loadInitial();
  }, [session]);

  const notifyNewOrder = () => {
    const soundOn = localStorage.getItem('camly_order_sound') !== 'false';
    if (soundOn) {
      playNewOrderSound();
    }
    const prevTitle = document.title;
    document.title = '🔔 (1) ¡Nuevo Pedido! - NEGU';
    setTimeout(() => {
      document.title = prevTitle;
    }, 8000);
    addToast('🔔 ¡Tienes un nuevo pedido entrante!', 'success');
  };

  useEffect(() => {
    if (business?.id && session?.user?.id) {
      // 1. Supabase Postgres Realtime
      const sub = subscribeToOrders((payload) => {
        loadData(session.user.id, false);
        if (!payload || payload.eventType === 'INSERT') {
          notifyNewOrder();
        }
      });

      // 2. BroadcastChannel instantáneo entre pestañas
      let bc;
      try {
        bc = new BroadcastChannel('negu_orders_channel');
        bc.onmessage = (msg) => {
          if (msg?.data?.type === 'NEW_ORDER' && (!msg.data.negocioId || msg.data.negocioId === business.id)) {
            loadData(session.user.id, false);
            notifyNewOrder();
          }
        };
      } catch {}

      // 3. Fallback de localStorage entre ventanas
      const handleStorage = (e) => {
        if (e.key === 'negu_latest_order_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (!parsed.bid || parsed.bid === business.id) {
              loadData(session.user.id, false);
              notifyNewOrder();
            }
          } catch {}
        }
      };
      window.addEventListener('storage', handleStorage);

      // 4. Polling inteligente de respaldo + reconexión en foco
      const handleFocus = () => {
        loadData(session.user.id, false);
      };
      window.addEventListener('focus', handleFocus);

      const pollInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadData(session.user.id, false);
        }
      }, 10000);

      return () => {
        sub.unsubscribe();
        if (bc) bc.close();
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('focus', handleFocus);
        clearInterval(pollInterval);
      };
    }
  }, [business?.id, session?.user?.id]);

  async function loadData(userId, showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const { data: biz, error: bizErr } = await getSupabase()
        .from('negocios')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (bizErr) throw bizErr;
      
      if (biz) {
        const [p, o, sub, cats] = await Promise.all([
          fetchProducts(biz.id), 
          fetchOrders(biz.id),
          fetchSubscription(biz.id),
          fetchCategories(biz.id)
        ]);
        setProducts(p); // local
        setGlobalProducts(p); // global (necesario para el conteo de CategoriasView)
        setOrders(o);
        setBusiness(biz, sub);
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      // No toast here to avoid spamming on background reloads
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await getSupabase().auth.signOut();
    setSession(null);
    setBusiness(null);
    addToast('Sesión cerrada', 'info');
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        await updateProduct(productData.id, productData);
        addToast('Producto actualizado', 'success');
      } else {
        await createProduct(productData);
        addToast('Producto creado', 'success');
      }
      if (business) {
        const p = await fetchProducts(business.id);
        setProducts(p);
        setGlobalProducts(p);
      }
    } catch (err) {
      console.error(err);
      addToast('Error al procesar producto', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      addToast('Producto eliminado', 'info');
      if (business) {
        const p = await fetchProducts(business.id);
        setProducts(p);
        setGlobalProducts(p);
      }
    } catch (err) {
      console.error(err);
      addToast('Error al eliminar', 'error');
    }
  };

  const handleToggleProductAvailability = async (product) => {
    try {
      await updateProduct(product.id, { ...product, disponible: !product.disponible });
      const refreshed = await fetchProducts(business.id);
      setProducts(refreshed);
      setGlobalProducts(refreshed);
      addToast(product.disponible ? 'Producto pausado en el catálogo' : 'Producto disponible en el catálogo', 'success');
    } catch (err) {
      console.error(err);
      addToast('No se pudo actualizar la disponibilidad', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Cargando Negocio...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen max-h-screen overflow-hidden bg-slate-50 flex flex-col lg:flex-row"
      style={{ 
        '--primary-brand': business?.theme_color || '#0284C7',
        '--secondary-brand': business?.color_secundario || '#F9FAFB'
      }}
    >
      <SEO 
        title="Panel de Administración | NEGU"
        description="Panel de administración de pedidos, catálogo y productos para tu negocio en NEGU."
        canonical="https://negu.pro/admin"
        noindex={true}
      />
      <Sidebar 
        business={business} 
        onSignOut={handleSignOut}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full max-h-screen overflow-hidden relative">
        <AdminHeader 
          title={currentPathSegment} 
          business={business} 
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />

        <main className="flex-1 min-h-0 px-3 pb-4 pt-1.5 sm:px-5 sm:pt-2.5 lg:px-6 overflow-y-auto relative">
          {isExpired && (
            <Suspense fallback={null}>
              <PlanExpiredView onOpenBilling={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))} />
            </Suspense>
          )}

          <div className={`max-w-7xl mx-auto transition-opacity duration-300 ${isExpired ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
            <Suspense fallback={<ViewLoader />}>
              <Outlet context={{
                orders,
                products,
                business,
                loadData,
                setEditingProduct,
                handleDeleteProduct,
                handleToggleProductAvailability,
                reloadOrders: () => loadData(session.user.id, false)
              }} />
            </Suspense>
          </div>
        </main>
      </div>

      {editingProduct && (
        <ProductModal 
          product={Object.keys(editingProduct).length > 0 ? editingProduct : null}
          products={products}
          businessId={business.id}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
      
      <BillingModal />

      {/* AI Assistant Modal */}
      <AiAssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        business={business}
        productsCount={products.length}
        onNavigateTab={(tab) => {
          const tabToPath = {
            dashboard: '/admin/dashboard',
            orders: '/admin/pedidos',
            pedidos: '/admin/pedidos',
            products: '/admin/productos',
            productos: '/admin/productos',
            categories: '/admin/categorias',
            categorias: '/admin/categorias',
            drivers: '/admin/domiciliarios',
            domiciliarios: '/admin/domiciliarios',
            settings: '/admin/configuracion',
            configuracion: '/admin/configuracion',
            revenue: '/admin/ingresos',
            ingresos: '/admin/ingresos',
          };
          navigate(tabToPath[tab] || `/admin/${tab}`);
        }}
      />
    </div>
  );
}
