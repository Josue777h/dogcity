import { X } from 'lucide-react';
import { useToastStore } from '../stores';

const typeStyles = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-[toast-in_0.3s_ease] ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <span className="text-sm font-semibold flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
