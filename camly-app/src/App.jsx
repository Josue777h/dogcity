import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import AuthGuard from './features/auth/AuthGuard';
import ToastContainer from './components/ui/ToastContainer';
import PageLoading from './components/common/PageLoading';
import ErrorBoundary from './components/common/ErrorBoundary';
import { clearClientCaches } from './lib/utils';

function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (firstErr) {
      await new Promise(resolve => setTimeout(resolve, 300));
      try {
        return await factory();
      } catch (secondErr) {
        if (!import.meta.env.DEV) {
          let alreadyReloaded = false;
          try {
            alreadyReloaded = sessionStorage.getItem('negu_lazy_recovered') === '1';
            if (!alreadyReloaded) {
              sessionStorage.setItem('negu_lazy_recovered', '1');
            }
          } catch (storageErr) {
            console.debug('sessionStorage no disponible:', storageErr);
          }
          if (!alreadyReloaded) {
            await clearClientCaches();
            window.location.reload();
            return new Promise(() => {});
          }
        }
        throw secondErr || firstErr;
      }
    }
  });
}

function RouteErrorBoundary({ children }) {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={`${location.pathname}${location.search}`}>
      {children}
    </ErrorBoundary>
  );
}

// Code Splitting (Lazy Loading with retry)
const StorePage = lazyWithRetry(() => import('./features/store/StorePage'));
const AdminPage = lazyWithRetry(() => import('./features/admin/AdminPage'));
const LoginPage = lazyWithRetry(() => import('./features/auth/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./features/auth/RegisterPage'));
const EmailVerificationPage = lazyWithRetry(() => import('./features/auth/EmailVerificationPage'));
const AuthCallbackPage = lazyWithRetry(() => import('./features/auth/AuthCallbackPage'));
const PasswordRecoveryPage = lazyWithRetry(() => import('./features/auth/PasswordRecoveryPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./features/auth/ResetPasswordPage'));
const TrackingPage = lazyWithRetry(() => import('./features/store/TrackingPage'));
const LandingPage = lazyWithRetry(() => import('./features/marketing/LandingPage'));
const WelcomePage = lazyWithRetry(() => import('./features/marketing/WelcomePage'));

// Commercial SEO Landing Pages
const MenuDigitalPage = lazyWithRetry(() => import('./features/marketing/MenuDigitalPage'));
const PedidosWhatsAppPage = lazyWithRetry(() => import('./features/marketing/PedidosWhatsAppPage'));
const GestionPedidosPage = lazyWithRetry(() => import('./features/marketing/GestionPedidosPage'));
const ParaRestaurantesPage = lazyWithRetry(() => import('./features/marketing/ParaRestaurantesPage'));
const ParaNegociosPage = lazyWithRetry(() => import('./features/marketing/ParaNegociosPage'));
const NotFoundPage = lazyWithRetry(() => import('./features/marketing/NotFoundPage'));
const TermsPage = lazyWithRetry(() => import('./features/legal/TermsPage'));
const PrivacyPage = lazyWithRetry(() => import('./features/legal/PrivacyPage'));
const CookiesPage = lazyWithRetry(() => import('./features/legal/CookiesPage'));

// Admin Views (Lazy Loaded)
const DashboardView = lazyWithRetry(() => import('./features/admin/views/DashboardView'));
const ComanderoView = lazyWithRetry(() => import('./features/admin/views/ComanderoView'));
const OrdersView = lazyWithRetry(() => import('./features/admin/views/OrdersView'));
const ProductsView = lazyWithRetry(() => import('./features/admin/views/ProductsView'));
const CategoriesView = lazyWithRetry(() => import('./features/admin/views/CategoriesView'));
const DriversView = lazyWithRetry(() => import('./features/admin/views/DriversView'));
const RevenueView = lazyWithRetry(() => import('./features/admin/views/RevenueView'));
const SettingsView = lazyWithRetry(() => import('./features/admin/views/SettingsView'));

import { useBusinessStore } from './stores';

export default function App() {
  const { business } = useBusinessStore();

  // Sync Global Theme
  useEffect(() => {
    const root = document.documentElement;
    const primary = business?.theme_color || '#0284C7';
    const secondary = business?.color_secundario || '#FFF7ED';
    
    root.style.setProperty('--primary-brand', primary);
    root.style.setProperty('--secondary-brand', secondary);
    root.style.setProperty('--color-brand', primary);
    root.style.setProperty('--color-brand-secondary', secondary);
  }, [business?.theme_color, business?.color_secundario]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <RouteErrorBoundary>
        <Suspense fallback={<PageLoading label="Cargando página" />}>
          <Routes>
          {/* ── MARKETING & PUBLIC SEO ───────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu-digital" element={<MenuDigitalPage />} />
          <Route path="/pedidos-whatsapp" element={<PedidosWhatsAppPage />} />
          <Route path="/gestion-de-pedidos" element={<GestionPedidosPage />} />
          <Route path="/para-restaurantes" element={<ParaRestaurantesPage />} />
          <Route path="/para-negocios" element={<ParaNegociosPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />

          {/* ── AUTH & ONBOARDING ────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/verificar-correo" element={<EmailVerificationPage />} />
          <Route path="/recuperar-contrasena" element={<PasswordRecoveryPage />} />
          <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
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
            <Route path="comandero" element={<ComanderoView />} />
            <Route path="mesas" element={<Navigate to="/admin/comandero" replace />} />
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
          <Route path="/comandero" element={<Navigate to="/admin/comandero" replace />} />
          <Route path="/pedidos" element={<Navigate to="/admin/pedidos" replace />} />
          <Route path="/productos" element={<Navigate to="/admin/productos" replace />} />
          <Route path="/categorias" element={<Navigate to="/admin/categorias" replace />} />
          
          {/* ── CUSTOMER EXPERIENCE ──────────────────────────── */}
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:id" element={<TrackingPage />} />
          
          {/* MULTI-TENANT STORE: Catches custom business slugs */}
          <Route path="/:slug" element={<StorePage />} />
          
          {/* Fallback 404 Profesional (sin redirecciones silenciosas a /) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
