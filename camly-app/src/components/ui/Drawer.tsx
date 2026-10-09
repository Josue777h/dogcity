import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

export function Drawer({ open, onClose, title, children, side = 'right', className = '' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  const placement = side === 'bottom'
    ? 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-2xl'
    : side === 'right'
      ? 'inset-y-0 right-0 w-full max-w-md rounded-l-2xl'
      : 'inset-y-0 left-0 w-full max-w-md rounded-r-2xl';
  return <div className="fixed inset-0 z-[120] bg-slate-950/50" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-label={title || 'Panel'} className={`absolute flex flex-col overflow-hidden bg-white shadow-2xl ${placement} ${className}`}>
      {side === 'bottom' && <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300" />}
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></header>
      <div className="overflow-y-auto p-5">{children}</div>
    </section>
  </div>;
}

export default Drawer;
