import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ConfirmModal({ 
  isOpen, 
  title = "¿Estás seguro?", 
  message = "Esta acción no se puede deshacer.",
  onConfirm, 
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}) {
  const [pending, setPending] = useState(false);
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      const result = await onConfirm();
      if (result !== false) onCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setPending(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-sm rounded-2xl border border-slate-200 overflow-hidden shadow-xl animate-fade-in">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 size={19} />
            </div>
            <button 
              type="button"
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3.5 space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 flex items-center justify-end gap-2.5 border-t border-slate-200/80">
          <button 
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {pending ? (
              <span className="inline-flex items-center gap-1.5">
                <LoadingSpinner size={14} /> Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
