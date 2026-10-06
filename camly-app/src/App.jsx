import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import AuthGuard from './features/auth/AuthGuard';
import ToastContainer from './components/ui/ToastContainer';

// Code Splitting (Lazy Loading)
const StorePage = lazy(() => import('./features/store/StorePage'));
const AdminPage = lazy(() => import('./features/admin/AdminPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const TrackingPage = lazy(() => import('./features/store/TrackingPage'));
const LandingPage = lazy(() => import('./features/marketing/LandingPage'));
const WelcomePage = lazy(() => import('./features/marketing/WelcomePage'));

// Commercial SEO Landing Pages
const MenuDigitalPage = lazy(() => import('./features/marketing/MenuDigitalPage'));
const PedidosWhatsAppPage = lazy(() => import('./features/marketing/PedidosWhatsAppPage'));
const GestionPedidosPage = lazy(() => import('./features/marketing/GestionPedidosPage'));
const ParaRestaurantesPage = lazy(() => import('./features/marketing/ParaRestaurantesPage'));
const ParaNegociosPage = lazy(() => import('./features/marketing/ParaNegociosPage'));
const NotFoundPage = lazy(() => import('./features/marketing/NotFoundPage'));

// Admin Views (Lazy Loaded)
const DashboardView = lazy(() => import('./features/admin/views/DashboardView'));
const OrdersView = lazy(() => import('./features/admin/views/OrdersView'));
const ProductsView = lazy(() => import('./features/admin/views/ProductsView'));
const CategoriesView = lazy(() => import('./features/admin/views/CategoriesView'));
const DriversView = lazy(() => import('./features/admin/views/DriversView'));
const RevenueView = lazy(() => import('./features/admin/views/RevenueView'));
const SettingsView = lazy(() => import('./features/admin/views/SettingsView'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-alt">
    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black text-muted tracking-[0.2em] uppercase">Cargando...</p>
    </div>
  </div>
);

import { useBusinessStore } from './stores';

export default function App() {
  const { business } = useBusinessStore();

  // Sync Global Theme
  useEffect(() => {
    const root = document.documentElement;
    const primary = business?.theme_color || '#0284C7';
    
    root.style.setProperty('--primary-brand', primary);
  }, [business?.theme_color, business?.color_secundario]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── MARKETING & PUBLIC SEO ───────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu-digital" element={<MenuDigitalPage />} />
          <Route path="/pedidos-whatsapp" element={<PedidosWhatsAppPage />} />
          <Route path="/gestion-de-pedidos" element={<GestionPedidosPage />} />
          <Route path="/para-restaurantes" element={<ParaRestaurantesPage />} />
          <Route path="/para-negocios" element={<ParaNegociosPage />} />

          {/* ── AUTH & ONBOARDING ────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/bienvenido" element={<WelcomePage />} />
          
          {/* ── ADMIN PANEL (PROTECTED NESTED ROUTES) ─────────── */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminPage />
              </AuthGuard>
            }
          >
            {/* Redirección por defecto a /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="pedidos" element={<OrdersView />} />
            <Route path="orders" element={<Navigate to="/admin/pedidos" replace />} />
            <Route path="productos" element={<ProductsView />} />
            <Route path="products" element={<Navigate to="/admin/productos" replace />} />
            <Route path="categorias" element={<CategoriesView />} />
            <Route path="categories" element={<Navigate to="/admin/categorias" replace />} />
            <Route path="domiciliarios" element={<DriversView />} />
            <Route path="drivers" element={<Navigate to="/admin/domiciliarios" replace />} />
            <Route path="ingresos" element={<RevenueView />} />
            <Route path="revenue" element={<Navigate to="/admin/ingresos" replace />} />
            <Route path="configuracion" element={<SettingsView />} />
            <Route path="settings" element={<Navigate to="/admin/configuracion" replace />} />
            {/* Fallback de ruta administrativa inválida */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Alias amigables de raíz hacia el panel de administración */}
          <Route path="/pedidos" element={<Navigate to="/admin/pedidos" replace />} />
          <Route path="/productos" element={<Navigate to="/admin/productos" replace />} />
          <Route path="/categorias" element={<Navigate to="/admin/categorias" replace />} />
          
          {/* ── CUSTOMER EXPERIENCE ──────────────────────────── */}
          <Route path="/tracking" element={<TrackingPage />} />
          
          {/* MULTI-TENANT STORE: Catches custom business slugs */}
          <Route path="/:slug" element={<StorePage />} />
          
          {/* Fallback 404 Profesional (sin redirecciones silenciosas a /) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
