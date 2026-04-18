export function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getBusinessSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('negocio') || 'dogcity';
}

/**
 * WhatsApp URL builder — FIX CRÍTICO para iOS/Mac/Desktop.
 * - Mobile (iOS/Android): usa wa.me (abre la app nativa)
 * - Desktop: usa api.whatsapp.com/send (más compatible que wa.me en navegadores de escritorio)
 */
export function buildWhatsAppUrl(phone, message) {
  const cleanPhone = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  // Desktop: api.whatsapp.com es más fiable que wa.me en navegadores de escritorio
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

/**
 * Abre WhatsApp de forma segura.
 * En Safari/iOS, window.open() después de un await es bloqueado como popup.
 * Esta función usa window.location.href como fallback.
 */
export function openWhatsApp(phone, message) {
  const url = buildWhatsAppUrl(phone, message);
  
  // Intentar window.open primero
  const win = window.open(url, '_blank');
  
  // Si fue bloqueado (Safari/iOS después de async), usar location
  if (!win || win.closed || typeof win.closed === 'undefined') {
    window.location.href = url;
  }
}
