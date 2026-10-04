import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import SaaSLogo from '../../../components/common/SaaSLogo';

export default function MarketingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ═══════════ TOP ANNOUNCEMENT BAR ═══════════ */}
      <div className="bg-gray-950 text-white text-xs py-2 px-3 sm:px-4 border-b border-gray-800/80 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-[#11CEFC] animate-pulse shrink-0" />
            <span className="font-medium text-gray-300 text-[11px] sm:text-xs">
              Prueba <strong className="text-white font-bold">7 días gratis</strong> · Sin tarjeta de crédito · 0% comisiones
            </span>
          </div>
          <Link to="/registro" className="hidden sm:inline-flex items-center gap-1 text-[#11CEFC] hover:text-cyan-300 font-bold transition-colors shrink-0 text-xs">
            <span>Crear catálogo gratis</span><ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ═══════════ STICKY NAVBAR ═══════════ */}
      <header className="sticky top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all duration-200">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
          <nav className="h-16 sm:h-20 flex items-center justify-between" aria-label="Navegación principal">
            
            {/* Logo NEGU */}
            <Link to="/" className="flex items-center gap-2 shrink-0 py-1" aria-label="Ir a la página de inicio de NEGU">
              <SaaSLogo className="h-10 sm:h-12 md:h-14" />
            </Link>

            {/* Desktop Navigation Links (SEO & Commercial) */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm font-semibold text-gray-600">
              <Link to="/menu-digital" className="hover:text-cyan-600 transition-colors">Menú Digital</Link>
              <Link to="/pedidos-whatsapp" className="hover:text-cyan-600 transition-colors">Pedidos WhatsApp</Link>
              <Link to="/gestion-de-pedidos" className="hover:text-cyan-600 transition-colors">Gestión de Pedidos</Link>
              <Link to="/para-restaurantes" className="hover:text-cyan-600 transition-colors">Para Restaurantes</Link>
              <Link to="/para-negocios" className="hover:text-cyan-600 transition-colors">Para Negocios</Link>
            </div>

            {/* Actions / CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to="/login" 
                className="hidden sm:inline-flex text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-950 px-3 py-2 rounded-full transition-colors"
              >
                Entrar
              </Link>

              <Link 
                to="/registro" 
                className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white hover:text-[#11CEFC] text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-full border border-gray-800 shadow-sm active:scale-95 transition-all duration-150"
              >
                <span>Probar gratis</span>
                <ArrowRight size={14} className="shrink-0 text-[#11CEFC]" />
              </Link>

              {/* Hamburger Button for Mobile */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {menuOpen && (
            <div className="pb-4 pt-1 flex flex-col gap-1 text-sm font-semibold text-gray-700 lg:hidden animate-fade-in-down border-t border-gray-100">
              <Link 
                to="/menu-digital" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Menú Digital para Negocios
              </Link>
              <Link 
                to="/pedidos-whatsapp" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Pedidos por WhatsApp
              </Link>
              <Link 
                to="/gestion-de-pedidos" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Gestión y Control de Pedidos
              </Link>
              <Link 
                to="/para-restaurantes" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Software para Restaurantes
              </Link>
              <Link 
                to="/para-negocios" 
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl hover:bg-cyan-50/70 hover:text-cyan-700 transition-colors"
              >
                Software para Comercios y Negocios
              </Link>
              
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full text-center py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link 
                  to="/registro" 
                  onClick={() => setMenuOpen(false)} 
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gray-950 hover:bg-black rounded-xl border border-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Crear tienda gratis</span>
                  <ArrowRight size={14} className="text-[#11CEFC]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
