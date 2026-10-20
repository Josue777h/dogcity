import { Phone, MapPin, Instagram, Facebook, Music2, Store, MessageCircle } from 'lucide-react';
import { createElement } from 'react';

const cleanHandle = (value = '') => String(value).replace(/^@/, '').trim();
const cleanPhone = (value = '') => String(value).replace(/[^\d+]/g, '');
const socialUrl = (network, value) => {
  const account = String(value || '').trim();
  if (/^https?:\/\//i.test(account)) return account;

  const handle = cleanHandle(account)
    .replace(new RegExp(`^(www\\.)?${network}\\.com/`, 'i'), '')
    .replace(/^@/, '');
  if (!handle) return '';
  if (network === 'tiktok') return `https://tiktok.com/@${handle}`;
  return `https://${network}.com/${handle}`;
};

function getFooterStyle(footerMessage) {
  if (typeof footerMessage !== 'string') return 'branded';

  try {
    const match = footerMessage.match(/<!--CAMLY_DESIGN:(.*?)-->/);
    if (!match?.[1]) return 'branded';
    return JSON.parse(match[1]).footer_style === 'minimal' ? 'minimal' : 'branded';
  } catch {
    return 'branded';
  }
}

export default function StoreFooter({ business, className = '', hasFloatingCart = false }) {
  if (!business) return null;

  const storeName = business.nombre_visible || business.nombre || 'Comercio';
  const brandColor = business.theme_color || '#0284C7';
  const isBranded = getFooterStyle(business.footer_message) === 'branded';
  const description = (business.footer_message || '')
    .replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '')
    .replace(/<!--CAMLY_DESIGN:[\s\S]*?-->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
  const phone = String(business.telefono || '').trim();
  const phoneHref = cleanPhone(phone);
  const whatsappContact = String(business.whatsapp_contacto || business.telefono || '').trim();
  const whatsappDigits = cleanPhone(whatsappContact).replace(/\D/g, '');
  const whatsappNumber = whatsappDigits.length === 10 ? `57${whatsappDigits}` : whatsappDigits;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';

  const socialLinks = [
    business.instagram && {
      label: 'Instagram',
      href: socialUrl('instagram', business.instagram),
      Icon: Instagram,
    },
    business.facebook && {
      label: 'Facebook',
      href: socialUrl('facebook', business.facebook),
      Icon: Facebook,
    },
    business.tiktok && {
      label: 'TikTok',
      href: socialUrl('tiktok', business.tiktok),
      Icon: Music2,
    },
  ].filter(Boolean);

  const brandTint = `color-mix(in srgb, ${brandColor} 8%, white)`;
  const brandBorder = `color-mix(in srgb, ${brandColor} 22%, white)`;

  return (
    <footer className={`border-t border-[#e7e3db] bg-white ${className}`}>
      <div className={`fluid-container pt-4 sm:pt-5 ${hasFloatingCart ? 'pb-24 md:pb-5' : 'pb-4 sm:pb-5'}`}>
        <section
          aria-label={`Información de ${storeName}`}
          className={`relative overflow-hidden rounded-2xl border ${isBranded ? 'p-4 sm:p-5' : 'border-[#e7e3db] bg-white p-4 sm:p-5'}`}
          style={isBranded ? { backgroundColor: brandTint, borderColor: brandBorder } : undefined}
        >
          {isBranded && (
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: brandColor }} />
          )}

          <div className="flex min-w-0 items-center justify-between gap-3 pl-1">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white"
                style={{ borderColor: brandBorder }}
              >
                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={`Logo de ${storeName}`}
                    className="h-full w-full object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <Store size={20} style={{ color: brandColor }} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="line-clamp-1 text-sm font-bold leading-snug text-slate-900 sm:text-base">{storeName}</h2>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {description || 'Catálogo y pedidos directos'}
                </p>
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-white/80"
                    style={{ color: brandColor }}
                  >
                    {createElement(Icon, { size: 17, strokeWidth: 1.8 })}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {(phone || business.direccion || whatsappHref) && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-black/5 pl-1 pt-3 text-xs text-slate-700">
              {phone && (
                <a href={`tel:${phoneHref}`} className="inline-flex min-h-9 min-w-0 items-center gap-2 font-medium hover:text-slate-950">
                  <Phone size={15} className="shrink-0" style={{ color: brandColor }} />
                  <span className="break-all">{phone}</span>
                </a>
              )}
              {business.direccion && (
                <div className="flex min-h-9 min-w-0 flex-1 basis-full items-start gap-2 py-1 sm:basis-auto">
                  <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: brandColor }} />
                  <span className="line-clamp-2 break-words leading-relaxed">{business.direccion}</span>
                </div>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageCircle size={15} />
                  <span>Escríbenos</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-black/5 pl-1 pt-2.5 text-[10px] text-slate-500">
            <p>© {new Date().getFullYear()} {storeName}</p>
            <p>Catálogo digital por <span className="font-semibold" style={{ color: brandColor }}>NEGU</span></p>
          </div>
        </section>
      </div>
    </footer>
  );
}
