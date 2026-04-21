import { Phone, MapPin, Instagram, Facebook, ShoppingBag, Music2 } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export default function StoreFooter({ business }) {
  if (!business) return null;

  return (
    <footer className="bg-dark text-white pt-10 pb-6 mt-12">
      <div className="fluid-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/10">
          
          {/* Logo & About */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white">
                 <ShoppingBag size={20} />
               </div>
               <h3 className="text-xl font-black italic tracking-tighter uppercase">{business.nombre_visible}</h3>
             </div>
             <p className="text-white/40 text-xs font-medium max-w-sm">
               {business.footer_message || 'El sabor que te mereces, directo a tu puerta.'}
             </p>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex gap-4">
                {business.instagram && (
                  <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-brand transition-colors"><Instagram size={20} /></a>
                )}
                {business.facebook && (
                  <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-brand transition-colors"><Facebook size={20} /></a>
                )}
                {business.tiktok && (
                  <a href={`https://tiktok.com/@${business.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-brand transition-colors"><Music2 size={20} /></a>
                )}
             </div>
             
             <div className="hidden sm:flex gap-4 text-xs font-bold text-white/60">
                 <span className="flex items-center gap-1"><Phone size={14} className="text-brand"/> {business.telefono}</span>
                 {business.direccion && <span className="flex items-center gap-1"><MapPin size={14} className="text-brand"/> {business.direccion}</span>}
             </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center sm:text-left">
           <p>© {new Date().getFullYear()} {business.nombre_visible}. Todos los derechos.</p>
           <p>Powered by <span className="text-white/40">CAMLY SaaS</span></p>
        </div>
      </div>
    </footer>
  );
}

