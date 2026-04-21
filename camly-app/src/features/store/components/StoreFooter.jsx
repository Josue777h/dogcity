import { Phone, MapPin, Instagram, Facebook, ShoppingBag } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export default function StoreFooter({ business }) {
  if (!business) return null;

  return (
    <footer className="bg-dark text-white pt-20 pb-10 mt-20">
      <div className="fluid-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/5">
          
          {/* Logo & About */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white">
                 <ShoppingBag size={22} />
               </div>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase">{business.nombre_visible}</h3>
             </div>
             <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">
               {business.footer_message || 'Gracias por confiar en nosotros. El sabor y la calidad que te mereces, directo a tu puerta.'}
             </p>
             <div className="flex gap-4">
                {business.instagram && (
                  <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                    <Instagram size={20} />
                  </a>
                )}
                {business.facebook && (
                  <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-brand hover:text-white transition-all">
                    <Facebook size={20} />
                  </a>
                )}
             </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Contacto</h4>
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <Phone size={18} className="text-brand shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">WhatsApp</p>
                    <p className="text-white/40 text-sm">{business.telefono}</p>
                  </div>
               </div>
               {business.direccion && (
                 <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-brand shrink-0" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">Dirección</p>
                      <p className="text-white/40 text-sm">{business.direccion}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Schedule Placeholder */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Horarios</h4>
            <div className="space-y-1">
               <p className="text-sm font-bold">Lunes - Domingo</p>
               <p className="text-white/40 text-sm">11:00 AM - 10:00 PM</p>
            </div>
            <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl">
               <p className="text-[10px] font-black text-brand uppercase tracking-widest leading-none">Entrega en</p>
               <p className="text-xl font-black mt-1">30-45 MIN</p>
            </div>
          </div>

        </div>

        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
           <p>© {new Date().getFullYear()} {business.nombre_visible}. Todos los derechos reservados.</p>
           <p>Powered by <span className="text-white/40">CAMLY SaaS</span></p>
        </div>
      </div>
    </footer>
  );
}
