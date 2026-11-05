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
      <div className="relative bg-white w-full max-w-xs sm:max-w-sm rounded-2xl border border-slate-200 overflow-hidden shadow-xl animate-fade-in">
        <div className="p-5 sm:p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={22} />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed break-words">
            {message}
          </p>
        </div>

        <div className="px-5 pb-5 pt-1 flex items-center justify-center gap-2.5">
          <button 
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 min-h-10 py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 min-h-10 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
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
