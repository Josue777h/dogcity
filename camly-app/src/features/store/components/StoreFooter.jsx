import { Phone, MapPin, Instagram, Facebook, Music2, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createElement } from 'react';

function WhatsAppMark({ size = 15 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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

function getFooterStyle(business) {
  if (business?.catalog_design && typeof business.catalog_design === 'object' && Object.keys(business.catalog_design).length) return business.catalog_design.footer_style === 'minimal' ? 'minimal' : 'branded';
  const footerMessage = business?.footer_message;
  if (typeof footerMessage !== 'string') return 'branded';

  try {
    const match = footerMessage.match(/<!--(?:NEGU|CAMLY)_DESIGN:(.*?)-->/);
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
  const isBranded = getFooterStyle(business) === 'branded';
  const description = (business.footer_message || '')
    .replace(/<!--(?:NEGU|CAMLY)_SCHEDULE:[\s\S]*?-->/g, '')
    .replace(/<!--(?:NEGU|CAMLY)_DESIGN:[\s\S]*?-->/g, '')
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

  const brandTint = `color-mix(in srgb, ${brandColor} 2%, white)`;
  const brandBorder = isBranded ? `color-mix(in srgb, ${brandColor} 28%, white)` : '#e7e3db';

  return (
    <footer
      className={`border-t ${className}`}
      style={{ backgroundColor: isBranded ? brandTint : '#ffffff', borderColor: brandBorder }}
    >
      <div className={`fluid-container py-6 sm:py-8 ${hasFloatingCart ? 'pb-28 md:pb-8' : ''}`}>
        <section aria-label={`Información de ${storeName}`} className="min-w-0 space-y-4 sm:space-y-6">
          
          {/* Fila principal: Información del negocio + Redes y WhatsApp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white shadow-2xs"
                style={{ borderColor: brandBorder }}
              >
                {business.logo_url ? (
                  <img src={business.logo_url} alt={`Logo de ${storeName}`} className="h-full w-full object-contain p-1" loading="lazy" />
                ) : (
                  <Store size={22} style={{ color: brandColor }} />
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base sm:text-lg font-bold leading-tight text-slate-900">{storeName}</h2>
                <p className="mt-0.5 line-clamp-1 text-xs sm:text-sm text-slate-600">
                  {description || 'Catálogo y pedidos directos'}
                </p>
              </div>
            </div>

            {/* Redes sociales y WhatsApp */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {socialLinks.length > 0 && (
                <nav aria-label={`Redes sociales de ${storeName}`} className="flex items-center gap-1">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white transition-colors hover:bg-black/5 text-slate-700 shadow-2xs"
                      style={{ color: isBranded ? brandColor : '#475569' }}
                    >
                      {createElement(Icon, { size: 18, strokeWidth: 1.8 })}
                    </a>
                  ))}
                </nav>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Contactar a ${storeName} por WhatsApp`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl text-white font-bold text-xs sm:text-sm px-3.5 shadow-2xs transition-opacity hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  <WhatsAppMark size={16} />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Fila secundaria: Teléfono y Dirección */}
          {(phone || business.direccion) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/5 pt-3 sm:pt-4 text-xs sm:text-sm text-slate-700 font-medium">
              {phone && (
                <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-2 hover:text-slate-950 transition-colors">
                  <Phone size={15} className="shrink-0" style={{ color: brandColor }} />
                  <span>{phone}</span>
                </a>
              )}
              {business.direccion && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="shrink-0" style={{ color: brandColor }} />
                  <span>{business.direccion}</span>
                </div>
              )}
            </div>
          )}

          {/* Pie legal y autoría: Legible, claro y proporcionado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-4 gap-y-2.5 border-t border-black/5 pt-3 sm:pt-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {storeName} · Catálogo activo</p>
            
            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1">
              <Link to="/privacidad" className="font-medium underline underline-offset-2 hover:text-slate-800">Privacidad</Link>
              <Link to="/terminos" className="font-medium underline underline-offset-2 hover:text-slate-800">Términos</Link>
              <Link to="/cookies" className="font-medium underline underline-offset-2 hover:text-slate-800">Cookies</Link>
              <a href="https://sedeelectronica.sic.gov.co/temas/proteccion-al-consumidor" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2 hover:text-slate-800">Protección al consumidor (SIC)</a>
            </div>

            <p>
              Catálogo digital con <span className="font-bold" style={{ color: isBranded ? brandColor : '#0f172a' }}>NEGU</span>
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
}
