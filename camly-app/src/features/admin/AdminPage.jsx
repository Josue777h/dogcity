import { useState, useEffect, lazy, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  getSupabase,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchOrders,
  subscribeToOrders,
  subscribeToTableCalls,
  fetchSubscription,
  fetchCategories
} from '../../lib/supabase';
import { playNewOrderSound, playTableCallSound } from '../../lib/utils';
import { useAuthStore, useToastStore, useBusinessStore } from '../../stores';
import { readMigratedLocalStorage } from '../../lib/localStorage';

// Modular Components
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import ProductModal from './components/ProductModal';
import BillingModal from '../../components/ui/BillingModal';
import SEO from '../../components/common/SEO';
import PageLoading from '../../components/common/PageLoading';

const PlanExpiredView = lazy(() => import('./views/PlanExpiredView'));

export default function AdminPage() {
  const { session, setSession } = useAuthStore();
  const { business, setBusiness, isExpired, setCategories, setProducts: setGlobalProducts } = useBusinessStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener la subruta actual (ej. /admin/pedidos -> 'pedidos')
  const currentPathSegment = location.pathname.split('/')[2] || 'dashboard';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWaiterLocked, setIsWaiterLocked] = useState(() => {
    try {
      return localStorage.getItem('negu_waiter_lock_active') === 'true';
    } catch {
      return false;
    }
  });
  const addToast = useToastStore((s) => s.addToast);

  // Bloqueo de ruta en Modo Mesero: impide salir de /admin/comandero sin PIN
  useEffect(() => {
    if (isWaiterLocked && currentPathSegment !== 'comandero' && currentPathSegment !== 'mesas') {
      navigate('/admin/comandero', { replace: true });
    }
  }, [isWaiterLocked, currentPathSegment, navigate]);

  // Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(session?.user?.id));
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    loadData(userId, true);
  }, [session?.user?.id]);

  const notifyNewOrder = () => {
    const soundOn = readMigratedLocalStorage('negu_order_sound', ['camly_order_sound']) !== 'false';
    if (soundOn) {
      playNewOrderSound();
    }
    const prevTitle = document.title;
    document.title = '(1) ¡Nuevo Pedido! - NEGU';
    setTimeout(() => {
      document.title = prevTitle;
    }, 8000);
    addToast('¡Tienes un nuevo pedido entrante!', 'success');
  };

  const lastCallNotifiedRef = useState({})[0];

  const notifyTableCall = (mesa) => {
    const strMesa = String(mesa || '');
    if (!strMesa) return;
    const now = Date.now();
    if (lastCallNotifiedRef[strMesa] && now - lastCallNotifiedRef[strMesa] < 30000) {
      return;
    }
    lastCallNotifiedRef[strMesa] = now;

    const soundOn = readMigratedLocalStorage('negu_order_sound', ['camly_order_sound']) !== 'false';
    if (soundOn) {
      playTableCallSound();
    }
    const prevTitle = document.title;
    document.title = `(Mesa ${strMesa}) Mesero solicitado - NEGU`;
    setTimeout(() => {
      document.title = prevTitle;
    }, 6000);
    addToast(`La Mesa #${strMesa} solicita atención del mesero`, 'info');
  };

  useEffect(() => {
    if (business?.id && session?.user?.id) {
      // 1. Supabase Postgres Realtime (aislado por negocio_id)
      const sub = subscribeToOrders((payload) => {
        loadData(session.user.id, false);
        if (!payload || payload.eventType === 'INSERT') {
          notifyNewOrder();
        }
      }, business.id);

      const handleTableSignal = (data) => {
        if (!data) return;
        if (data.type === 'NEW_ORDER' && (!data.negocioId || data.negocioId === business.id)) {
          loadData(session.user.id, false);
          notifyNewOrder();
        } else if (data.type === 'CALL_WAITER' && (!data.businessId || data.businessId === business.id)) {
          const strMesa = String(data.mesa || '');
          if (strMesa) {
            try {
              const stored = localStorage.getItem('negu_active_table_calls');
              const parsed = stored ? JSON.parse(stored) : {};
              parsed[strMesa] = data.timestamp || Date.now();
              localStorage.setItem('negu_active_table_calls', JSON.stringify(parsed));
            } catch (err) {
              console.debug('Error guardando llamado de mesa:', err);
            }
          }
          notifyTableCall(data.mesa);
        } else if (data.type === 'RESOLVE_WAITER_CALL' && (!data.businessId || data.businessId === business.id)) {
          delete lastCallNotifiedRef[String(data.mesa)];
          try {
            const stored = localStorage.getItem('negu_active_table_calls');
            if (stored) {
              const parsed = JSON.parse(stored);
              delete parsed[String(data.mesa)];
              localStorage.setItem('negu_active_table_calls', JSON.stringify(parsed));
            }
            localStorage.removeItem('negu_table_call_event');
          } catch (err) {
            console.debug('Error limpiando llamado de mesero:', err);
          }
        }
      };

      // 2. BroadcastChannel instantáneo entre pestañas + Realtime entre dispositivos
      let bc;
      try {
        bc = new BroadcastChannel('negu_orders_channel');
        bc.onmessage = (msg) => handleTableSignal(msg?.data);
      } catch (err) {
        console.debug('BroadcastChannel no disponible:', err);
      }

      const tableSub = subscribeToTableCalls(business.id, handleTableSignal);

      // 3. Fallback de localStorage entre ventanas
      const handleStorage = (e) => {
        if (e.key === 'negu_latest_order_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (!parsed.bid || parsed.bid === business.id) {
              loadData(session.user.id, false);
              notifyNewOrder();
            }
          } catch (err) {
            console.debug('Error leyendo evento de pedido:', err);
          }
        } else if (e.key === 'negu_table_call_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (!parsed.businessId || parsed.businessId === business.id) {
              notifyTableCall(parsed.mesa);
            }
          } catch (err) {
            console.debug('Error leyendo llamado de mesa:', err);
          }
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
        tableSub.unsubscribe();
        if (bc) bc.close();
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('focus', handleFocus);
        clearInterval(pollInterval);
      };
    }
  }, [business?.id, session?.user?.id]);

  async function loadData(userId, showSpinner = true) {
    if (showSpinner && !business?.id) setLoading(true);
    const safetyTimer = showSpinner
      ? setTimeout(() => setLoading(false), 7000)
      : null;

    try {
      const { data: biz, error: bizErr } = await getSupabase()
        .from('negocios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (bizErr) throw bizErr;
      
      if (biz) {
        const [pRes, oRes, subRes, catsRes] = await Promise.allSettled([
          fetchProducts(biz.id), 
          fetchOrders(biz.id),
          fetchSubscription(biz.id),
          fetchCategories(biz.id)
        ]);
        const p = pRes.status === 'fulfilled' ? pRes.value : [];
        const o = oRes.status === 'fulfilled' ? oRes.value : [];
        const sub = subRes.status === 'fulfilled' ? subRes.value : null;
        const cats = catsRes.status === 'fulfilled' ? catsRes.value : [];

        setProducts(p); // local
        setGlobalProducts(p); // global (necesario para el conteo de CategoriasView)
        setOrders(o);
        setBusiness(biz, sub);
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      if (safetyTimer) clearTimeout(safetyTimer);
      setLoading(false);
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
        await updateProduct(productData.id, productData, business?.id);
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
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id, business?.id);
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
      await updateProduct(product.id, { ...product, disponible: !product.disponible }, business?.id);
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
    return <PageLoading label="Preparando tu panel" />;
  }

  return (
    <div 
      className="admin-theme min-h-dvh bg-slate-50 flex flex-col lg:h-dvh lg:max-h-dvh lg:overflow-hidden lg:flex-row"
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
      {!isWaiterLocked && (
        <Sidebar 
          business={business} 
          onSignOut={handleSignOut}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative lg:min-h-0 lg:h-full lg:max-h-dvh lg:overflow-hidden">
        {!isWaiterLocked && (
          <AdminHeader 
            title={currentPathSegment} 
            business={business} 
            onOpenMenu={() => setIsMenuOpen(true)}
          />
        )}

        <main className="flex-1 px-3 pb-24 pt-3 sm:px-6 sm:pt-5 sm:pb-8 lg:min-h-0 lg:px-8 lg:pb-8 lg:overflow-y-auto lg:overscroll-y-contain relative">
          {isExpired && (
            <Suspense fallback={null}>
              <PlanExpiredView onOpenBilling={() => window.dispatchEvent(new CustomEvent('open-billing-modal'))} />
            </Suspense>
          )}

          <div className={`max-w-7xl mx-auto transition-opacity duration-300 ${isExpired ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
            <Suspense fallback={<PageLoading fullscreen={false} label="Cargando sección" />}>
              <Outlet context={{
                orders,
                products,
                business,
                loadData,
                setEditingProduct,
                handleDeleteProduct,
                handleToggleProductAvailability,
                isWaiterLocked,
                setIsWaiterLocked,
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
    </div>
  );
}
