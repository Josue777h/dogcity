import { useState, useEffect } from 'react';

export function useAnimatedCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    if (num === 0) { setCount(0); return; }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: 1, label: 'Débil', color: 'bg-error' };
  if (score <= 3) return { score: 2, label: 'Regular', color: 'bg-warning' };
  return { score: 3, label: 'Fuerte', color: 'bg-success' };
}

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

/** Suma items de un pedido (soporta formato items[] y productos[]) */
export function getOrderSubtotal(order) {
  const items = order?.items || order?.productos || [];
  if (!Array.isArray(items) || items.length === 0) return Number(order?.total) || 0;
  return items.reduce((sum, i) => {
    const qty = i.cantidad ?? i.quantity ?? 1;
    const price = i.precio ?? i.price ?? 0;
    return sum + qty * price;
  }, 0);
}

/** Pedido a domicilio sin costo de envío confirmado aún */
export function isDeliveryPending(order) {
  if (order?.entrega_metodo !== 'envio') return false;
  const domCost = Number(order?.domicilio_costo) || 0;
  if (domCost > 0) return false;
  const subtotal = getOrderSubtotal(order);
  return Math.abs(subtotal - (Number(order?.total) || 0)) < 1;
}

/** Mensaje WhatsApp al cliente con domicilio ya confirmado */
export function buildDeliveryConfirmationMessage(order, businessName, domicilioCosto, trackingUrl) {
  const items = order.items || order.productos || [];
  const subtotal = getOrderSubtotal(order);
  const total = subtotal + domicilioCosto;
  const orderRef = order.id?.toString().slice(-6).toUpperCase();

  const itemsLines = items.map(i => {
    const qty = i.cantidad ?? i.quantity ?? 1;
    const name = i.nombre ?? i.name ?? 'Producto';
    const price = i.precio ?? i.price ?? 0;
    return `• ${qty}x ${name} — ${formatMoney(price * qty)}`;
  }).join('\n');

  return [
    `¡Hola ${order.nombre}!`,
    '',
    `Tu pedido *#${orderRef}* en *${businessName}*:`,
    '',
    itemsLines,
    `Domicilio: ${formatMoney(domicilioCosto)}`,
    '',
    `*TOTAL A PAGAR: ${formatMoney(total)}*`,
    '',
    `¿Confirmamos tu pedido? Responde *SI* para continuar`,
    trackingUrl ? `Seguimiento: ${trackingUrl}` : '',
  ].filter(Boolean).join('\n');
}

/** Obtener dirección legible desde coordenadas (Photon reverse geocoding) */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    const data = await res.json();
    const f = data?.features?.[0];
    if (!f) return null;
    const p = f.properties;
    return [p.name, p.street, p.city].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
}
