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
          
          {/* ── ADMIN PANEL (PROTECTED) ──────────────────────── */}
          <Route path="/admin" element={
            <AuthGuard>
              <AdminPage />
            </AuthGuard>
          } />
          
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
