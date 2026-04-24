import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import StorePage from './features/store/StorePage';
import AdminPage from './features/admin/AdminPage';
import RegisterPage from './features/auth/RegisterPage';
import TrackingPage from './features/store/TrackingPage';
import LandingPage from './features/marketing/LandingPage';
import WelcomePage from './features/marketing/WelcomePage';
import AuthGuard from './features/auth/AuthGuard';
import ToastContainer from './components/ui/ToastContainer';

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
    </BrowserRouter>
  );
}
