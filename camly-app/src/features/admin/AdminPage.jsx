import { useState, useEffect, lazy, Suspense } from 'react';
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

// Views (lazy-loaded para mejor rendimiento)
const DashboardView = lazy(() => import('./views/DashboardView'));
const ProductsView = lazy(() => import('./views/ProductsView'));
const OrdersView = lazy(() => import('./views/OrdersView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const DriversView = lazy(() => import('./views/DriversView'));
const CategoriesView = lazy(() => import('./views/CategoriesView'));
const PlanExpiredView = lazy(() => import('./views/PlanExpiredView'));
const RevenueView = lazy(() => import('./views/RevenueView'));

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
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    if (business?.id && session?.user?.id) {
      const sub = subscribeToOrders((payload) => {
        loadData(session.user.id, false); // Reload without full loading state

        // Alerta sonora y visual ante nuevo pedido
        if (!payload || payload.eventType === 'INSERT') {
          const soundOn = localStorage.getItem('camly_order_sound') !== 'false';
          if (soundOn) {
            playNewOrderSound();
          }
          const prevTitle = document.title;
          document.title = '🔔 (1) ¡Nuevo Pedido! - Camly';
          setTimeout(() => {
            document.title = prevTitle;
          }, 8000);
          addToast('🔔 ¡Tienes un nuevo pedido entrante!', 'success');
        }
      });
      return () => { sub.unsubscribe(); };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Cargando Negocio...</p>
      </div>
    );
  }

  return (
    <div 
      className="h-screen max-h-screen overflow-hidden bg-[#F6F4EF] flex flex-col lg:flex-row"
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
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        business={business} 
        onSignOut={handleSignOut}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full max-h-screen overflow-hidden relative">
        <AdminHeader 
          title={activeTab} 
          business={business} 
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
        />

        <main className="flex-1 min-h-0 px-3 pb-8 pt-3 sm:px-6 sm:pt-4 lg:px-8 overflow-y-auto relative">
          {isExpired && (
            <Suspense fallback={null}>
              <PlanExpiredView onOpenBilling={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))} />
            </Suspense>
          )}

          <div className={`max-w-7xl mx-auto transition-opacity duration-300 ${isExpired ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
            <Suspense fallback={<ViewLoader />}>
              {activeTab === 'dashboard' && (
                <DashboardView 
                  orders={orders} 
                  products={products} 
                  business={business}
                  onNavigate={setActiveTab}
                />
              )}
              {activeTab === 'products' && (
                <ProductsView 
                  products={products} 
                  onAdd={() => setEditingProduct({})} 
                  onEdit={setEditingProduct}
                  onDelete={handleDeleteProduct}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersView 
                  orders={orders} 
                  onUpdate={() => loadData(session.user.id, false)} 
                />
              )}
              {activeTab === 'revenue' && (
                <RevenueView 
                  orders={orders} 
                  business={business}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsView 
                  business={business} 
                  onUpdate={() => loadData(session.user.id, false)} 
                />
              )}
              {activeTab === 'drivers' && (
                <DriversView businessId={business.id} />
              )}
              {activeTab === 'categories' && (
                <CategoriesView businessId={business.id} />
              )}
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

      {/* Floating Movia Trigger */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-5 right-5 z-[70] px-3.5 py-2 rounded-full bg-gray-950 hover:bg-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-gray-800 text-xs font-medium"
        title="Consultar a Movia"
        aria-label="Abrir asistente Movia"
      >
        <Sparkles size={13} className="text-gray-300" />
        <span>Movia</span>
      </button>

      {/* AI Assistant Modal */}
      <AiAssistantModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        business={business}
        productsCount={products.length}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
