import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../../stores';

const typeConfig = {
  success: {
    style: 'bg-slate-900/95 border-slate-800 text-white',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
  error: {
    style: 'bg-rose-950/95 border-rose-800 text-white',
    icon: AlertCircle,
    iconColor: 'text-rose-400',
  },
  warning: {
    style: 'bg-amber-950/95 border-amber-800 text-white',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  info: {
    style: 'bg-slate-900/95 border-slate-800 text-white',
    icon: Info,
    iconColor: 'text-sky-400',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-[calc(env(safe-area-inset-top)+0.5rem)] left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-1.5 sm:left-auto sm:right-4 sm:top-3.5 sm:translate-x-0 sm:items-end">
      {toasts.slice(-2).map((toast) => {
        const cfg = typeConfig[toast.type] || typeConfig.info;
        const Icon = cfg.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto inline-flex max-w-[88vw] sm:max-w-xs items-center gap-2 px-3 py-1.5 rounded-full border shadow-md backdrop-blur-xs animate-[toast-in_0.2s_ease] ${cfg.style}`}
          >
            <Icon size={13} className={`shrink-0 ${cfg.iconColor}`} />
            <span className="truncate text-xs font-medium leading-tight">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar aviso"
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-0.5 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
