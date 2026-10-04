import { Phone, MapPin, Instagram, Facebook, ShoppingBag, Music2 } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export default function StoreFooter({ business }) {
  if (!business) return null;

  return (
    <footer className="border-t mt-16" style={{ backgroundColor: 'var(--color-sidebar)', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="fluid-container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          
          {/* Logo & About */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <div className="flex items-center gap-3">
               <div
                 className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                 style={{ backgroundColor: 'var(--color-brand)' }}
               >
                 <ShoppingBag size={18} />
               </div>
               <h3 className="text-base font-semibold text-white tracking-tight">{business.nombre_visible}</h3>
             </div>
             <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
               {business.footer_message || 'El sabor que te mereces, directo a tu puerta.'}
             </p>
          </div>

          {/* Contact & Social */}
          <div className="flex flex-wrap items-center gap-6">
             <div className="flex items-center gap-4">
                {business.instagram && (
                  <a
                    href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {business.facebook && (
                  <a
                    href={`https://facebook.com/${business.facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {business.tiktok && (
                  <a
                    href={`https://tiktok.com/@${business.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-brand)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    aria-label="TikTok"
                  >
                    <Music2 size={18} />
                  </a>
                )}
             </div>
             
             <div className="flex flex-wrap gap-4 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                 {business.telefono && (
                   <span className="flex items-center gap-1.5">
                     <Phone size={13} style={{ color: 'var(--color-brand)' }} />
                     {business.telefono}
                   </span>
                 )}
                 {business.direccion && (
                   <span className="flex items-center gap-1.5">
                     <MapPin size={13} style={{ color: 'var(--color-brand)' }} />
                     {business.direccion}
                   </span>
                 )}
             </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
           <p>© {new Date().getFullYear()} {business.nombre_visible}. Todos los derechos reservados.</p>
           <p className="flex items-center gap-1">
             Impulsado por <span className="font-semibold text-white/80">Negu</span> · Catálogo digital & WhatsApp
           </p>
        </div>
      </div>
    </footer>
  );
}

