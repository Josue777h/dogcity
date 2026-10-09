import { Phone, MapPin, Instagram, Facebook, Music2, Store } from 'lucide-react';
import { createElement } from 'react';

export default function StoreFooter({ business, className = '' }) {
  if (!business) return null;

  const storeName = business.nombre_visible || business.nombre || 'Comercio';
  const description = (business.footer_message || '')
    .replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '')
    .replace(/<!--CAMLY_DESIGN:[\s\S]*?-->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const socialLinks = [
    business.instagram && {
      label: 'Instagram',
      href: `https://instagram.com/${business.instagram.replace('@', '')}`,
      Icon: Instagram,
    },
    business.facebook && {
      label: 'Facebook',
      href: `https://facebook.com/${business.facebook}`,
      Icon: Facebook,
    },
    business.tiktok && {
      label: 'TikTok',
      href: `https://tiktok.com/@${business.tiktok.replace('@', '')}`,
      Icon: Music2,
    },
  ].filter(Boolean);

  return (
    <footer className={`mt-3 border-t border-slate-200 bg-white ${className}`}>
      <div className="fluid-container py-4 sm:py-5">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {business.logo_url ? (
                <img
                  src={business.logo_url}
                  alt={`Logo de ${storeName}`}
                  className="h-full w-full object-contain p-1"
                  loading="lazy"
                />
              ) : (
                <Store size={19} className="text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{storeName}</h2>
              {description && (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{description}</p>
              )}
            </div>
          </div>

          {socialLinks.length > 0 && (
            <nav aria-label={`Redes sociales de ${storeName}`} className="flex shrink-0 items-center gap-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  {createElement(Icon, { size: 16 })}
                </a>
              ))}
            </nav>
          )}
        </div>

        {(business.telefono || business.direccion) && (
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:grid-cols-2">
            {business.telefono && (
              <a
                href={`tel:${business.telefono}`}
                className="flex min-h-9 min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 transition-colors hover:bg-slate-100"
              >
                <Phone size={14} className="shrink-0 text-slate-400" />
                <span className="break-all font-medium">{business.telefono}</span>
              </a>
            )}
            {business.direccion && (
              <div className="flex min-h-9 min-w-0 items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span className="line-clamp-2 break-words leading-relaxed">{business.direccion}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400">
          <p>© {new Date().getFullYear()} {storeName}</p>
          <p>Catálogo digital por <span className="font-semibold text-slate-600">NEGU</span></p>
        </div>
      </div>
    </footer>
  );
}
