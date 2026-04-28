import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';
import AuthGuard from './features/auth/AuthGuard';
import ToastContainer from './components/ui/ToastContainer';

// Code Splitting (Lazy Loading)
const StorePage = lazy(() => import('./features/store/StorePage'));
const AdminPage = lazy(() => import('./features/admin/AdminPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const TrackingPage = lazy(() => import('./features/store/TrackingPage'));
const LandingPage = lazy(() => import('./features/marketing/LandingPage'));
const WelcomePage = lazy(() => import('./features/marketing/WelcomePage'));

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
    const primary = business?.theme_color || '#2563EB';
    
    root.style.setProperty('--primary-brand', primary);
    
    // Also update favicon or title if needed (optional)
  }, [business?.theme_color, business?.color_secundario]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── MARKETING & PUBLIC ───────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
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
          
          {/* MULTI-TENANT STORE: This catches everything else as a slug */}
          <Route path="/:slug" element={<StorePage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
