import React from 'react';
import { Link } from 'react-router-dom';
import SaaSLogo from '../../../components/common/SaaSLogo';

export default function MarketingFooter() {
  return (
    <footer className="bg-black text-gray-400 text-sm border-t border-gray-900 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-900">
          
          {/* Columna 1: Marca NEGU */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" aria-label="Inicio de NEGU">
              <SaaSLogo className="h-8 text-white" />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              NEGU centraliza y simplifica la gestión de tu negocio con menú digital interactivo, pedidos con GPS y conexión directa a WhatsApp con 0% de comisiones.
            </p>
            <p className="text-[11px] text-gray-500">
              Sitio web oficial: <strong className="text-gray-300 font-semibold">https://negu.pro</strong>
            </p>
          </div>

          {/* Columna 2: Soluciones SEO Comerciales */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Soluciones</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/menu-digital" className="hover:text-white transition-colors">
                  Menú Digital para Negocios
                </Link>
              </li>
              <li>
                <Link to="/pedidos-whatsapp" className="hover:text-white transition-colors">
                  Pedidos por WhatsApp
                </Link>
              </li>
              <li>
                <Link to="/gestion-de-pedidos" className="hover:text-white transition-colors">
                  Gestión y Control de Pedidos
                </Link>
              </li>
              <li>
                <Link to="/para-restaurantes" className="hover:text-white transition-colors">
                  Software para Restaurantes
                </Link>
              </li>
              <li>
                <Link to="/para-negocios" className="hover:text-white transition-colors">
                  Software para Pequeños Negocios
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Funcionalidades Clave */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Características</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Ubicación GPS exacta para repartidores</li>
              <li>Pedidos para domicilio y recogida en local</li>
              <li>Comandas listas para cocina e impresión térmica</li>
              <li>Actualización de precios y stock en tiempo real</li>
              <li>0% comisiones sobre tus ventas</li>
            </ul>
          </div>

          {/* Columna 4: Acceso y Plataforma */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Plataforma</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/registro" className="text-[#11CEFC] hover:underline font-semibold">
                  Crear tienda gratis (7 días de prueba)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-white transition-colors">
                  Rastreo de pedido en vivo
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Barra inferior de copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} NEGU. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span>NEGU — Plataforma para gestión de negocios</span>
            <span className="text-[#11CEFC]">negu.pro</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
