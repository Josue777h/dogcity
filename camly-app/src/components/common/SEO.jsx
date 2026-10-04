import { useEffect } from 'react';

/**
 * SEO Component — NEGU
 * Gestiona de forma dinámica y canónica los títulos, metaetiquetas, Open Graph y canonical URLs
 * para cada página de la aplicación.
 */
export default function SEO({
  title = 'NEGU | Gestión para tu negocio',
  description = 'NEGU simplifica la gestión de tu negocio con menú digital, pedidos, clientes y WhatsApp en un solo lugar.',
  canonical = 'https://negu.pro/',
  ogImage = 'https://negu.pro/og-image.png',
  ogType = 'website',
  noindex = false,
  structuredData = null
}) {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // Helper para actualizar o crear meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Meta Description
    setMetaTag('name', 'description', description);

    // 3. Robots
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 4. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // 5. Open Graph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'NEGU');

    // 6. Twitter / X Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 7. Structured Data (JSON-LD) si se pasa específicamente para la página
    let jsonLdScript = document.getElementById('page-structured-data');
    if (structuredData) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'page-structured-data';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(structuredData);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [title, description, canonical, ogImage, ogType, noindex, structuredData]);

  return null;
}
