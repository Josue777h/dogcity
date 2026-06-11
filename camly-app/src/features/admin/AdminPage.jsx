import { useState, useEffect, lazy, Suspense } from 'react';
import { Store, Loader2, ChevronRight, LogOut, Bike } from 'lucide-react';
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
import { useAuthStore, useToastStore, useBusinessStore } from '../../stores';

// Modular Components
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import ProductModal from './components/ProductModal';
import BillingModal from '../../components/ui/BillingModal';

// Views (lazy-loaded para mejor rendimiento)
const DashboardView = lazy(() => import('./views/DashboardView'));
const ProductsView = lazy(() => import('./views/ProductsView'));
const OrdersView = lazy(() => import('./views/OrdersView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const DriversView = lazy(() => import('./views/DriversView'));
const CategoriesView = lazy(() => import('./views/CategoriesView'));
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      const sub = subscribeToOrders(() => {
        loadData(session.user.id, false); // Reload without full loading state
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
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Cargando Negocio...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-bg-alt flex flex-col lg:flex-row"
      style={{ 
        '--primary-brand': business?.theme_color || '#2563EB',
        '--secondary-brand': business?.color_secundario || '#F9FAFB'
      }}
    >
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        business={business} 
        onSignOut={handleSignOut}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <AdminHeader 
          title={activeTab} 
          business={business} 
          onOpenMenu={() => setIsMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative">
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
    </div>
  );
}
