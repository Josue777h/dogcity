import { Phone, MapPin, Instagram, Facebook, Music2, Store } from 'lucide-react';
import { createElement } from 'react';

export default function StoreFooter({ business, className = '', hasFloatingCart = false }) {
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
    <footer className={`border-t border-[#e7e3db] bg-white ${className}`}>
      <div className={`fluid-container py-3.5 sm:py-4 ${hasFloatingCart ? 'pb-24 md:pb-4' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e7e3db] bg-[#f7f6f2]">
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
              <h2 className="line-clamp-1 text-sm font-semibold leading-snug text-slate-900">{storeName}</h2>
              {description && (
                <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-slate-500">{description}</p>
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-[#f7f6f2] hover:text-slate-900"
                >
                  {createElement(Icon, { size: 16 })}
                </a>
              ))}
            </nav>
          )}
        </div>

        {(business.telefono || business.direccion) && (
          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#f0ede7] pt-2.5 text-xs text-slate-600">
            {business.telefono && (
              <a
                href={`tel:${business.telefono}`}
                className="inline-flex min-h-9 min-w-0 max-w-full items-center gap-2 py-1 transition-colors hover:text-slate-900"
              >
                <Phone size={14} className="shrink-0 text-slate-400" />
                <span className="break-all font-medium">{business.telefono}</span>
              </a>
            )}
            {business.direccion && (
              <div className="flex min-h-9 min-w-0 items-start gap-2 py-1 sm:max-w-[65%]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span className="line-clamp-2 break-words leading-relaxed">{business.direccion}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#f0ede7] pt-2 text-[10px] text-slate-400">
          <p>© {new Date().getFullYear()} {storeName}</p>
          <p>Catálogo digital por <span className="font-semibold text-slate-600">NEGU</span></p>
        </div>
      </div>
    </footer>
  );
}
