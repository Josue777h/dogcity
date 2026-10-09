import { Phone, MapPin, Instagram, Facebook, Music2, Store } from 'lucide-react';

export default function StoreFooter({ business }) {
  if (!business) return null;

  const description = (business.footer_message || '')
    .replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '')
    .replace(/<!--CAMLY_DESIGN:[\s\S]*?-->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  return (
    <footer className="mt-6 border-t border-slate-200 bg-white">
      <div className="fluid-container py-4 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {business.logo_url
                ? <img src={business.logo_url} alt={`Logo de ${business.nombre_visible || business.nombre}`} className="h-full w-full object-contain" loading="lazy" />
                : <Store size={20} className="text-slate-500" />}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900">{business.nombre_visible || business.nombre}</h2>
              {description && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{description}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
            {business.telefono && <a href={`tel:${business.telefono}`} className="inline-flex items-center gap-1.5 hover:text-slate-900"><Phone size={13} className="text-slate-400" />{business.telefono}</a>}
            {business.direccion && <span className="inline-flex min-w-0 items-center gap-1.5"><MapPin size={13} className="shrink-0 text-slate-400" /><span className="truncate">{business.direccion}</span></span>}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              {business.instagram && <a href={`https://instagram.com/${business.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-slate-500 hover:text-slate-900"><Instagram size={16} /></a>}
              {business.facebook && <a href={`https://facebook.com/${business.facebook}`} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-slate-500 hover:text-slate-900"><Facebook size={16} /></a>}
              {business.tiktok && <a href={`https://tiktok.com/@${business.tiktok.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="TikTok" className="text-slate-500 hover:text-slate-900"><Music2 size={16} /></a>}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} {business.nombre_visible || business.nombre}</p>
          <p>Catálogo digital por <span className="font-semibold text-slate-600">NEGU</span></p>
        </div>
      </div>
    </footer>
  );
}
