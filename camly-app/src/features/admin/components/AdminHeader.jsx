import { Copy, ExternalLink, Menu } from 'lucide-react';
import { useToastStore } from '../../../stores';

export default function AdminHeader({ title, business, onOpenMenu }) {
  const addToast = useToastStore(s => s.addToast);
  const storeUrl = `${window.location.origin}/${business?.nombre}`;

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    addToast('Link copiado al portapapeles', 'success');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-[80] px-4 sm:px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="lg:hidden p-2 bg-bg-alt text-dark rounded-lg hover:bg-border transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-dark uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] text-muted font-bold block sm:hidden uppercase tracking-widest mt-0.5">
            {business?.nombre_visible}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-[9px] font-black text-muted uppercase tracking-widest">Tienda Activa</span>
          <span className="text-[11px] font-bold text-dark">{business?.nombre}.camly.app</span>
        </div>
        
        <div className="flex items-center bg-bg-alt border border-border rounded-xl p-1 gap-1">
          <button 
            onClick={copyLink}
            title="Copiar link"
            className="p-2 text-muted hover:text-brand hover:bg-brand/5 rounded-lg transition-all"
          >
            <Copy size={16} />
          </button>
          <a 
            href={`/${business?.nombre}`} 
            target="_blank" 
            rel="noreferrer"
            title="Abrir tienda"
            className="flex items-center gap-2 bg-brand text-white px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black transition-all hover:bg-brand/90 shadow-lg shadow-brand/20"
          >
            <span className="hidden sm:inline">VER TIENDA</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
