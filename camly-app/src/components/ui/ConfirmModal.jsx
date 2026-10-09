import { Trash2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-sm max-h-[calc(100dvh-1.5rem)] flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="px-5 py-5 sm:px-6 sm:py-6 text-center relative overflow-hidden">
           {/* Glow background */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-[40px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-error/5 rounded-full blur-[40px] pointer-events-none" />

           <button 
             onClick={onCancel}
             className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-alt text-muted hover:text-dark hover:bg-border transition-colors z-10"
           >
             <X size={16} />
           </button>

           <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center mx-auto text-error shadow-lg shadow-error/20 mb-1">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-black text-dark uppercase tracking-tight">
                {title}
              </h2>
              <p className="text-sm font-medium text-muted leading-relaxed max-w-[32rem] mx-auto break-words">
                {message}
              </p>
           </div>
        </div>

        <div className="p-3 sm:p-4 bg-bg-alt/50 flex items-center gap-2 sm:gap-3 border-t border-border shrink-0">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-border text-[10px] font-black text-dark uppercase tracking-widest hover:bg-bg-alt hover:border-dark/20 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 py-3 px-4 rounded-xl bg-error text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20 hover:bg-error/90 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            {pending ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Procesando</span> : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
