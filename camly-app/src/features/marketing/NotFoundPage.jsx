import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home, Smartphone, MessageCircle, UtensilsCrossed } from 'lucide-react';
import SEO from '../../components/common/SEO';
import MarketingNavbar from './components/MarketingNavbar';
import MarketingFooter from './components/MarketingFooter';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#FBFBFC] text-gray-900 font-sans flex flex-col justify-between">
      <SEO 
        title="Página no encontrada | NEGU"
        description="La página que buscas no existe o ha sido movida. Explora las soluciones de NEGU para gestionar tu negocio."
        canonical="https://negu.pro/404"
        noindex={true}
      />

      <MarketingNavbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6">
        <div className="max-w-xl mx-auto text-center space-y-6">
          
          <div className="w-20 h-20 rounded-3xl bg-cyan-50 border border-cyan-200/80 text-[#0284C7] flex items-center justify-center mx-auto shadow-xs">
            <Compass size={40} />
          </div>

          <span className="inline-block text-xs font-black tracking-widest text-[#0284C7] uppercase">
            Error 404 · Ruta no encontrada
          </span>

          <h1 className="font-display text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Parece que te has desviado del camino
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            La página que estás intentando abrir no existe o ha sido trasladada. Pero no te preocupes, aquí tienes enlaces útiles para continuar navegando en NEGU:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <Link 
              to="/" 
              className="p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center gap-3 text-xs font-bold text-gray-800"
            >
              <Home size={18} className="text-[#0284C7] shrink-0" />
              <span>Ir al inicio de NEGU</span>
            </Link>

            <Link 
              to="/menu-digital" 
              className="p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center gap-3 text-xs font-bold text-gray-800"
            >
              <Smartphone size={18} className="text-[#0284C7] shrink-0" />
              <span>Menú digital para negocios</span>
            </Link>

            <Link 
              to="/pedidos-whatsapp" 
              className="p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center gap-3 text-xs font-bold text-gray-800"
            >
              <MessageCircle size={18} className="text-[#0284C7] shrink-0" />
              <span>Pedidos por WhatsApp</span>
            </Link>

            <Link 
              to="/para-restaurantes" 
              className="p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-cyan-300 hover:shadow-xs transition-all flex items-center gap-3 text-xs font-bold text-gray-800"
            >
              <UtensilsCrossed size={18} className="text-[#0284C7] shrink-0" />
              <span>Software para restaurantes</span>
            </Link>
          </div>

          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] font-bold text-xs sm:text-sm px-6 py-3 rounded-full border border-gray-800 shadow-sm transition-all"
            >
              <span>Volver a la página principal</span>
              <ArrowRight size={14} className="text-[#11CEFC]" />
            </Link>
          </div>

        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
