import qrcodeBrowser from 'qrcode/lib/browser.js';

/**
 * Generador de código QR para navegador (evita problemas de precompilación con Vite)
 */
export async function generateQrDataUrl(text, options = {}) {
  const q = qrcodeBrowser?.default || qrcodeBrowser;
  const toDataURL = typeof q?.toDataURL === 'function' ? q.toDataURL.bind(q) : q?.toDataURL;
  if (!toDataURL) throw new Error('Generador QR no disponible');
  return toDataURL(text, options);
}
