import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import SaaSLogo from '../../../components/common/SaaSLogo';

const NAV_LINKS = [
  { to: '/menu-digital', label: 'Menú Digital', mobile: 'Menú Digital para Negocios' },
  { to: '/pedidos-whatsapp', label: 'Pedidos WhatsApp', mobile: 'Pedidos por WhatsApp' },
  { to: '/gestion-de-pedidos', label: 'Gestión de Pedidos', mobile: 'Gestión y Control de Pedidos' },
  { to: '/para-restaurantes', label: 'Para Restaurantes', mobile: 'Software para Restaurantes' },
  { to: '/para-negocios', label: 'Para Negocios', mobile: 'Software para Comercios y Negocios' },
];

export default function MarketingNavbar() {
  const location = useLocation();
  // El menú móvil se considera abierto solo en la ruta donde se abrió, así se cierra al navegar.
  const [openPath, setOpenPath] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef(null);
  const menuOpen = openPath === location.pathname;
  const closeMenu = () => setOpenPath(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const updateMenuPosition = () => {
      if (headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
    };
    updateMenuPosition();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = event => { if (event.key === 'Escape') setOpenPath(null); };
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, { passive: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition);
    };
  }, [menuOpen]);

  return (
    <>
      {/* ═══════════ BARRA DE ANUNCIO ═══════════ */}
      <div className="relative z-50 overflow-hidden bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 px-3 py-2 text-xs text-white sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2.5 sm:justify-between">
          <p className="flex items-center gap-2 text-center text-[11px] font-medium sm:text-left sm:text-xs">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="mk-ping-soft absolute inline-flex h-full w-full rounded-full bg-white" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span>Prueba <strong className="font-extrabold">7 días gratis</strong> · Sin tarjeta · 0% comisiones</span>
          </p>
          <Link to="/registro" className="group hidden shrink-0 items-center gap-1 text-xs font-bold text-white/95 hover:text-white sm:inline-flex">
            <span>Crear catálogo gratis</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ═══════════ NAVBAR PEGAJOSA ═══════════ */}
      <header
        ref={headerRef}
        className={`sticky top-0 inset-x-0 z-[60] border-b backdrop-blur-xl transition-all duration-300 ${
          scrolled ? 'border-slate-200 bg-white/90 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]' : 'border-transparent bg-white/95'
        }`}
      >
        <div className="mx-auto max-w-6xl px-3.5 sm:px-6">
          <nav className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`} aria-label="Navegación principal">
            <Link to="/" className="flex shrink-0 items-center gap-2 py-1" aria-label="Ir a la página de inicio de NEGU">
              <SaaSLogo className={`transition-all duration-300 ${scrolled ? 'h-9 sm:h-10' : 'h-10 sm:h-12'}`} />
            </Link>

            <div className="hidden items-center gap-1 text-xs font-semibold text-slate-600 lg:flex xl:text-sm">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `group relative rounded-full px-3.5 py-2 transition-colors ${isActive ? 'text-sky-700' : 'hover:text-slate-950'}`}
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.label}</span>
                      <span className={`absolute inset-0 rounded-full bg-sky-50 transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:bg-slate-100'}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="hidden rounded-full px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:inline-flex sm:text-sm"
              >
                Entrar
              </Link>

              <Link
                to="/registro"
                className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-700 active:scale-95 sm:px-5 sm:text-sm"
              >
                <span>Probar gratis</span>
                <ArrowRight size={14} className="shrink-0 text-cyan-300 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <button
                onClick={() => setOpenPath(menuOpen ? null : location.pathname)}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
                aria-controls="marketing-mobile-menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {menuOpen && createPortal(
            <div
              id="marketing-mobile-menu"
              style={{ top: menuTop }}
              className="fixed inset-x-0 bottom-0 z-[70] overflow-y-auto overscroll-contain bg-white px-4 pb-8 pt-4 text-sm font-semibold text-slate-700 lg:hidden"
            >
              {NAV_LINKS.map((link, idx) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  style={{ '--mk-delay': `${idx * 55}ms` }}
                  className="mk-menu-item flex w-full items-center justify-between rounded-2xl px-4 py-4 transition-colors hover:bg-sky-50 hover:text-sky-700"
                >
                  <span>{link.mobile}</span>
                  <ArrowRight size={16} className="text-slate-300" />
                </Link>
              ))}

              <div className="mk-menu-item mt-3 flex flex-col gap-2.5 border-t border-slate-100 pt-4" style={{ '--mk-delay': `${NAV_LINKS.length * 55}ms` }}>
                <Link to="/login" onClick={closeMenu} className="w-full rounded-2xl bg-slate-100 py-3 text-center text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
                  Iniciar sesión
                </Link>
                <Link to="/registro" onClick={closeMenu} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-sky-700">
                  <span>Crear tienda gratis</span>
                  <ArrowRight size={14} className="text-cyan-300" />
                </Link>
              </div>
            </div>,
            document.body,
          )}
        </div>
      </header>
    </>
  );
}
