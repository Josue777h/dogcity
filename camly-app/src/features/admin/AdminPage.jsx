import { useState, useEffect } from 'react';
import { Store, Loader2, ChevronRight, LogOut, Bike } from 'lucide-react';
import { 
  getSupabase, 
  signIn, 
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

// Views
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import OrdersView from './views/OrdersView';
import SettingsView from './views/SettingsView';
import DriversView from './views/DriversView';
import CategoriesView from './views/CategoriesView';
import PlanExpiredView from './views/PlanExpiredView';

export default function AdminPage() {
  const { session, setSession } = useAuthStore();
  const { business, setBusiness, isExpired, setCategories, setProducts: setGlobalProducts } = useBusinessStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session: s } } = await getSupabase().auth.getSession();
      setSession(s);
      if (s) loadData(s.user.id);
      else setLoading(false);
    }
    checkAuth();
  }, [setSession]);

  useEffect(() => {
    if (business?.id) {
      const sub = subscribeToOrders(() => {
        loadData(session?.user?.id, false); // Reload without full loading state
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const s = await signIn(email, password);
      setSession(s);
      await loadData(s.user.id);
      addToast('Bienvenido al Panel Admin', 'success');
    } catch (err) {
      addToast('Credenciales inválidas', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  if (loading && session) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand mb-4" size={48} />
        <p className="text-xs font-black text-muted uppercase tracking-[0.3em]">Cargando Negocio...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-bg-alt to-bg-alt">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand/30 mb-6 animate-bounce">
              <Store size={40} />
            </div>
            <h1 className="text-4xl font-black text-dark tracking-tighter uppercase italic">CAMLY <span className="text-brand">ADMIN</span></h1>
            <p className="text-xs text-muted font-black tracking-[0.2em] uppercase mt-2">Panel de Control Inteligente</p>
          </div>

          <div className="bg-white border border-border p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-dark/5">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Email Registrado</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@tuapp.com" 
                  className="w-full px-5 py-4 bg-bg-alt border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none font-bold text-sm shadow-inner"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full px-5 py-4 bg-bg-alt border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none font-bold text-sm shadow-inner"
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoggingIn} 
                className="w-full btn-primary !py-5 shadow-2xl shadow-brand/30 disabled:opacity-50 group"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={24} /> : <div className="flex items-center justify-center gap-3">ACCEDER AHORA <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></div>}
              </button>
            </form>
            
            <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black text-muted uppercase tracking-widest">
              <a href="/registro" className="hover:text-brand transition-colors border-b border-transparent hover:border-brand">¿No tienes cuenta? Regístrate</a>
              <span className="opacity-40">Powered by Camly SaaS</span>
            </div>
          </div>
        </div>
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
            <PlanExpiredView onOpenBilling={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))} />
          )}

          <div className={`max-w-7xl mx-auto transition-opacity duration-300 ${isExpired ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
            {activeTab === 'dashboard' && <DashboardView orders={orders} products={products} />}
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
