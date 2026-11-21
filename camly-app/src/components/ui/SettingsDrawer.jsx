import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Panel lateral deslizable (Slide-Over Drawer) renderizado en document.body via Portal.
 * Evita cualquier recorte por transforms de contenedores padres y mantiene un fondo limpio de pantalla completa.
 */
export default function SettingsDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  footer,
  onSubmit,
  widthClass = 'max-w-md',
  children,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const Wrapper = onSubmit ? 'form' : 'div';
  const wrapperProps = onSubmit ? { onSubmit } : {};

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[200] flex justify-end"
    >
      {/* Fondo sutil a pantalla completa (sin blur pesado ni bordes cortados) */}
      <div
        className="fixed inset-0 bg-slate-950/40 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel derecho estilo Stripe / Shopify */}
      <Wrapper
        {...wrapperProps}
        className={`relative z-10 w-full ${widthClass} h-dvh bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-fade-in`}
      >
        {/* Cabecera fija */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-start justify-between gap-3 bg-white shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={17} />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-950 leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          {children}
        </div>

        {/* Pie fijo */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/80 shrink-0">
            {footer}
          </div>
        )}
      </Wrapper>
    </div>,
    document.body
  );
}
