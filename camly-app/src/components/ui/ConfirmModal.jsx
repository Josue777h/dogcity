import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title = "¿Estás seguro?", 
  message = "Esta acción no se puede deshacer.",
  onConfirm, 
  onCancel,
  confirmText = "Eliminar",
  cancelText = "Cancelar"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-sm flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="p-8 text-center relative overflow-hidden">
           {/* Glow background */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-[40px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-error/5 rounded-full blur-[40px] pointer-events-none" />

           <button 
             onClick={onCancel}
             className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-alt text-muted hover:text-dark hover:bg-border transition-colors z-10"
           >
             <X size={16} />
           </button>

           <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 bg-error/10 rounded-[1.5rem] flex items-center justify-center mx-auto text-error shadow-xl shadow-error/20 mb-2">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-black text-dark uppercase tracking-tight">
                {title}
              </h2>
              <p className="text-sm font-medium text-muted leading-relaxed max-w-[250px] mx-auto">
                {message}
              </p>
           </div>
        </div>

        <div className="p-4 bg-bg-alt/50 flex items-center gap-3 border-t border-border">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-border text-[10px] font-black text-dark uppercase tracking-widest hover:bg-bg-alt hover:border-dark/20 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-error text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20 hover:bg-error/90 hover:scale-[1.02] transition-all"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
