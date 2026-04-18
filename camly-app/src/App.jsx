import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorePage from './pages/StorePage';
import AdminPage from './pages/AdminPage';
import RegisterPage from './pages/RegisterPage';
import TrackingPage from './pages/TrackingPage';
import ToastContainer from './components/ToastContainer';

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Rutas principales del SaaS */}
        <Route path="/" element={<StorePage />} />
        <Route path="/:slug" element={<StorePage />} />
        
        {/* Panel Administrativo (detecta slug por query param o auth) */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Registro de negocios para el SaaS */}
        <Route path="/registro" element={<RegisterPage />} />
        
        {/* Seguimiento de pedidos */}
        <Route path="/tracking" element={<TrackingPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
