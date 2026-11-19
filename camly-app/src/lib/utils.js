import { useState, useEffect } from 'react';

/** Escapa texto no confiable antes de insertarlo en HTML (recibos y comandas). */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formatea un arreglo de opciones seleccionadas incluyendo el título de su grupo
 * para que en carrito, tickets, comandero y WhatsApp siempre se distinga de qué
 * grupo proviene cada elección (ej. "Adicional de carne: Cerdo · Adicional salsa: Queso").
 */
export function formatGroupedOptionsText(options = [], fallbackText = '', { includePrice = true } = {}) {
  const cleanFallback = String(fallbackText || '').trim();
  const optsList = Array.isArray(options) ? options.filter(Boolean) : [];
  if (optsList.length === 0) return cleanFallback;

  const hasGroupMetadata = optsList.some((o) => String(o?.grupo_titulo || o?.groupTitle || '').trim() !== '');
  if (!hasGroupMetadata && cleanFallback.includes(':')) {
    return cleanFallback;
  }

  const groupedOptions = [];
  const groupMap = new Map();

  optsList.forEach((opt) => {
    if (typeof opt === 'string') {
      const text = opt.trim();
      if (!text) return;
      if (!groupMap.has('_default')) {
        const entry = { title: '', items: [] };
        groupMap.set('_default', entry);
        groupedOptions.push(entry);
      }
      groupMap.get('_default').items.push({ nombre: text, precio: 0 });
      return;
    }

    const title = String(opt.grupo_titulo || opt.groupTitle || '').trim();
    const gKey = opt.grupo_id || title || '_default';
    if (!groupMap.has(gKey)) {
      const entry = { title, items: [] };
      groupMap.set(gKey, entry);
      groupedOptions.push(entry);
    }
    groupMap.get(gKey).items.push(opt);
  });

  const formatOpt = (o) => {
    const label = String(o?.nombre || o?.label || o?.name || '').trim();
    if (!label) return '';
    const price = Number(o?.precio ?? o?.price ?? 0);
    return includePrice && price > 0 ? `${label} (+$${price.toLocaleString('es-CO')})` : label;
  };

  const parts = groupedOptions
    .map(({ title, items: gItems }) => {
      const cleanItems = gItems.map(formatOpt).filter(Boolean);
      if (cleanItems.length === 0) return '';
      const choicesText = (/mitad/i.test(title) && cleanItems.length === 2)
        ? `1/2 ${cleanItems[0]} + 1/2 ${cleanItems[1]}`
        : cleanItems.join(', ');
      return title ? `${title}: ${choicesText}` : choicesText;
    })
    .filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : cleanFallback;
}

/** Celda CSV entre comillas que neutraliza fórmulas (=, +, -, @) para evitar CSV injection. */
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function clearClientCaches() {
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
  } catch (err) {
    console.warn('No se pudieron desregistrar los Service Workers:', err);
  }
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map(key => window.caches.delete(key)));
    }
  } catch (err) {
    console.warn('No se pudieron limpiar las cachés del navegador:', err);
  }
}

export async function reloadWithFreshCache() {
  await clearClientCaches();
  try {
    sessionStorage.removeItem('negu_preload_recovered');
    sessionStorage.removeItem('negu_lazy_recovered');
  } catch (err) {
    console.debug('sessionStorage no disponible:', err);
  }
  window.location.reload();
}

export function useAnimatedCounter(target, duration = 1500) {
  const num = typeof target === 'number' ? target : parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (num === 0) {
      const frame = requestAnimationFrame(() => setCount(0));
      return () => cancelAnimationFrame(frame);
    }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [num, duration]);
  return num === 0 ? 0 : count;
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

/** Formatea dígitos en tiempo real usando separador de miles con punto (es-CO). */
export function formatThousandsInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('es-CO');
}

/** Convierte una cadena formateada con puntos de miles a número entero. */
export function parseThousandsInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

/**
 * WhatsApp URL builder — FIX CRÍTICO para iOS/Mac/Desktop.
 * - Mobile (iOS/Android): usa wa.me (abre la app nativa)
 * - Desktop: usa api.whatsapp.com/send (más compatible que wa.me en navegadores de escritorio)
 */
export function buildWhatsAppUrl(phone, message) {
  let cleanPhone = (phone || '').replace(/\D/g, '');
  // Si tiene 10 dígitos y empieza por 3 (celular colombiano estándar), anteponer indicativo 57
  if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
    cleanPhone = '57' + cleanPhone;
  }
  const encoded = encodeURIComponent(message);
  
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  // Desktop: api.whatsapp.com es más fiable que wa.me en navegadores de escritorio
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

/** Renderiza mensajes de WhatsApp amigables y fáciles de leer en pantalla móvil. */
export function formatWhatsAppMessage(title, sections = [], intro = '') {
  const lines = [`*${String(title || '').trim()}*`];
  if (String(intro || '').trim()) {
    lines.push('', String(intro).trim());
  }
  sections.forEach(section => {
    const rows = (section.lines || []).filter(Boolean).map(line => String(line));
    if (!rows.length) return;
    lines.push('', `*${String(section.title || '').trim()}*`, ...rows);
  });
  return lines.join('\n');
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

/**
 * Alerta sonora de nuevo pedido (Web Audio API nativa sin archivos externos)
 * Toca un tono brillante de 3 campanadas (C5 - E5 - G5)
 */
export function playNewOrderSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const startTime = ctx.currentTime + idx * 0.12;
      const duration = 0.35;
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('Audio alert not allowed or failed:', err);
  }
}

/**
 * Alerta sonora de llamado de mesa / mesero (Web Audio API nativa)
 * Toca un tono brillante de doble campana de servicio (A5 - D6)
 */
export function playTableCallSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Doble campana de servicio de restaurante (Ding-Ding)
    const dings = [880, 1174.66, 1174.66];
    dings.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const startTime = ctx.currentTime + idx * 0.18;
      const duration = 0.4;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    console.warn('Audio alert not allowed or failed:', err);
  }
}

/**
 * Exportar pedidos a formato CSV con codificación UTF-8 BOM compatible con Excel
 */
export function exportOrdersToCSV(orders, businessName = 'Negu') {
  if (!orders || orders.length === 0) return false;

  const headers = [
    'ID Pedido',
    'Fecha',
    'Hora',
    'Cliente',
    'Teléfono',
    'Método Entrega',
    'Dirección / Ubicación',
    'Método Pago',
    'Estado',
    'Subtotal',
    'Costo Domicilio',
    'Total',
    'Productos y Opciones',
    'Comentarios'
  ];

  const rows = orders.map(o => {
    const dateObj = o.created_at ? new Date(o.created_at) : new Date();
    const dateStr = dateObj.toLocaleDateString('es-CO');
    const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    const items = o.items || o.productos || [];
    const itemsSummary = (Array.isArray(items) ? items : []).map(i => {
      const qty = i.cantidad ?? i.quantity ?? 1;
      const name = i.nombre ?? i.name ?? 'Item';
      const resolvedOpts = formatGroupedOptionsText(i.opciones || i.options, i.opciones_texto || '');
      const optStr = resolvedOpts ? ` [${resolvedOpts}]` : '';
      const notaStr = i.nota ? ` (${i.nota})` : '';
      return `${qty}x ${name}${optStr}${notaStr}`;
    }).join('; ');

    const subtotal = getOrderSubtotal(o);
    const domCost = Number(o.domicilio_costo) || 0;
    const total = Number(o.total) || (subtotal + domCost);

    return [
      `#${o.id?.toString().slice(-6).toUpperCase() || o.id}`,
      dateStr,
      timeStr,
      csvCell(o.nombre || ''),
      csvCell(o.telefono || ''),
      o.entrega_metodo === 'envio' ? 'Domicilio' : 'Retiro en tienda',
      csvCell(o.direccion || o.ubicacion_link || ''),
      o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo',
      (o.status || o.estado || 'nuevo').toUpperCase(),
      subtotal,
      domCost,
      total,
      csvCell(itemsSummary),
      csvCell(o.comentarios || '')
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanBiz = (businessName || 'negocio').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `pedidos_${cleanBiz}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Evaluar si un negocio está abierto según su horario configurado
 */
export function checkBusinessSchedule(business) {
  if (!business) return { isOpen: true, message: 'Abierto ahora' };
  let schedule = business.horario && typeof business.horario === 'object' && Object.keys(business.horario).length ? business.horario : null;
  if (!schedule && typeof business.footer_message === 'string') {
    try {
      const match = business.footer_message.match(/<!--(?:NEGU|CAMLY)_SCHEDULE:(.*?)-->/);
      if (match?.[1]) schedule = JSON.parse(match[1]);
    } catch { schedule = null; }
  }
  if (!schedule || !schedule.dias || !Object.keys(schedule.dias).length) return { isOpen: true, message: 'Abierto ahora', mode: 'auto' };
  if (schedule.abierto_manual === false) return { isOpen: false, message: 'Cerrado temporalmente por el comercio', mode: 'manual_closed' };

  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: business.timezone || 'America/Bogota', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  } catch {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  }
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const index = weekdayIndex[parts.find(part => part.type === 'weekday')?.value] ?? new Date().getDay();
  const currentDay = days[index];
  const previousDay = days[(index + 6) % 7];
  const minutes = Number(parts.find(part => part.type === 'hour')?.value || 0) * 60 + Number(parts.find(part => part.type === 'minute')?.value || 0);
  const asMinutes = value => { const [h, m] = String(value || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null; };
  const openAt = (day, isPrevious = false) => {
    const config = schedule.dias?.[day];
    if (!config?.activo) return false;
    if (config.todo_el_dia) return !isPrevious;
    const opens = asMinutes(config.abre || '09:00');
    const closes = asMinutes(config.cierra || '22:00');
    if (opens === null || closes === null || opens === closes) return false;
    return isPrevious ? closes < opens && minutes <= closes : closes > opens ? minutes >= opens && minutes <= closes : minutes >= opens;
  };
  if (openAt(currentDay) || openAt(previousDay, true)) {
    const closesAt = schedule.dias?.[currentDay]?.cierra;
    return { isOpen: true, message: closesAt ? `Abierto ahora - Cierra a las ${closesAt}` : 'Abierto ahora' };
  }
  const today = schedule.dias?.[currentDay];
  if (!today?.activo) return { isOpen: false, message: 'Cerrado hoy', nextOpen: 'Abre en el proximo dia laboral' };
  return { isOpen: false, message: `Cerrado - Horario hoy: ${today.abre || '09:00'} a ${today.cierra || '22:00'}` };
}

/**
 * Imprimir ticket térmico (58mm / 80mm):
 * - mode = 'kitchen': Comanda exclusiva para cocina (solo platos, cantidades, opciones y notas; sin precios ni totales)
 * - mode = 'bill': Cuenta / Recibo de cobro para el cliente (platos + precios + subtotal + total)
 */
export function printThermalReceipt(order, business, options = {}) {
  if (!order) return;

  const mode = options.mode === 'kitchen' ? 'kitchen' : 'bill';
  const isAddition = Boolean(options.isAddition);

  const dateObj = order.created_at ? new Date(order.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const shortId = (order.id || '').toString().slice(-6).toUpperCase();
  const businessName = business?.nombre_visible || business?.nombre || 'Mi Negocio';
  const businessPhone = business?.telefono || '';

  const rawItems = (options.itemsOverride && options.itemsOverride.length > 0)
    ? options.itemsOverride
    : (order.items || order.productos || []);
  const items = Array.isArray(rawItems) ? rawItems : [];

  const subtotal = getOrderSubtotal(order);
  const domCost = Number(order.domicilio_costo || order.delivery_fee || 0);
  const total = Number(order.total_amount || order.total) || (subtotal + domCost);
  const isMesa = order.delivery_type === 'dine_in' || order.entrega_metodo === 'mesa' || Boolean(order.mesa || order.table_number) || (typeof order.direccion === 'string' && /mesa/i.test(order.direccion));
  const tableNum = order.mesa || order.table_number || (order.direccion || '').match(/mesa\s*#?\s*([a-zA-Z0-9_-]+)/i)?.[1] || '1';
  const isEnvio = !isMesa && (order.entrega_metodo === 'envio' || order.delivery_type === 'delivery');

  const itemsKitchenHtml = items.map(p => {
    const qty = p.cantidad ?? p.quantity ?? 1;
    const name = p.nombre ?? p.name ?? 'Producto';
    const toppingFallback = Array.isArray(p.toppings)
      ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ')
      : '';
    const optText = formatGroupedOptionsText(
      p.opciones || p.options,
      p.opciones_texto || toppingFallback,
      { includePrice: false }
    );
    const nota = (p.nota || '').trim();

    return `
      <div style="margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dashed #999;">
        <div style="font-weight: 900; font-size: 15px; line-height: 1.25;">
          ${qty}x ${escapeHtml(name)}
        </div>
        ${optText ? `<div style="font-size: 12px; margin-left: 8px; color: #000; font-weight: 700; margin-top: 3px;">+ ${escapeHtml(optText)}</div>` : ''}
        ${nota ? `<div style="font-size: 12px; margin-left: 8px; font-weight: 900; background: #e5e7eb; padding: 3px 6px; border-left: 3px solid #000; margin-top: 4px;">NOTA: ${nota.toUpperCase()}</div>` : ''}
      </div>
    `;
  }).join('');

  const itemsBillHtml = items.map(p => {
    const qty = p.cantidad ?? p.quantity ?? 1;
    const name = p.nombre ?? p.name ?? 'Producto';
    const price = p.precio ?? p.price ?? 0;
    const itemTotal = price * qty;
    const toppingFallback = Array.isArray(p.toppings)
      ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ')
      : '';
    const optText = formatGroupedOptionsText(
      p.opciones || p.options,
      p.opciones_texto || toppingFallback,
      { includePrice: true }
    );
    const nota = (p.nota || '').trim();

    return `
      <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #bbb;">
        <div style="display: flex; justify-content: space-between; gap: 8px; font-weight: 700; font-size: 12px;">
          <span>${qty}x ${escapeHtml(name)}</span>
          <span style="white-space: nowrap;">$${itemTotal.toLocaleString('es-CO')}</span>
        </div>
        ${optText ? `<div style="font-size: 11px; margin-left: 6px; color: #222; margin-top: 2px;">+ ${escapeHtml(optText)}</div>` : ''}
        ${nota ? `<div style="font-size: 10px; margin-left: 6px; color: #333; margin-top: 2px;">Nota: ${escapeHtml(nota)}</div>` : ''}
      </div>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=400,height=640');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para imprimir.');
    return;
  }

  const locationLabel = isMesa
    ? `MESA #${escapeHtml(tableNum)}`
    : isEnvio
      ? 'SERVICIO A DOMICILIO'
      : 'PARA RECOGER EN LOCAL';

  const paymentLabel = isMesa && (order.pago_metodo === 'mesa' || order.payment_method === 'pending_table')
    ? 'CUENTA DE MESA'
    : order.pago_metodo === 'transferencia'
      ? 'TRANSFERENCIA'
      : 'EFECTIVO';

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${mode === 'kitchen' ? 'Comanda Cocina' : 'Cuenta'} #${shortId} - ${escapeHtml(businessName)}</title>
        <style>
          @page { margin: 0; size: auto; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
            width: 76mm;
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            background: #fff;
            font-size: 12px;
            line-height: 1.35;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 2px solid #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; gap: 6px; }
          .badge-mode {
            display: inline-block;
            padding: 4px 10px;
            font-size: 13px;
            font-weight: 900;
            border: 2px solid #000;
            border-radius: 4px;
            margin-top: 4px;
            background: #000;
            color: #fff;
            letter-spacing: 0.03em;
          }
          .toolbar {
            display: flex;
            gap: 6px;
            margin-bottom: 12px;
            padding: 6px;
            background: #f1f5f9;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
          }
          .toolbar button {
            flex: 1;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #0f172a;
            cursor: pointer;
          }
          .toolbar button.active {
            background: #0f172a;
            color: #fff;
            border-color: #0f172a;
          }
          @media print {
            body { padding: 4px; width: 100%; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print toolbar">
          <button id="btn-kitchen" class="${mode === 'kitchen' ? 'active' : ''}" onclick="setMode('kitchen')">Comanda Cocina</button>
          <button id="btn-bill" class="${mode === 'bill' ? 'active' : ''}" onclick="setMode('bill')">Cuenta / Cobro</button>
        </div>

        <!-- VISTA 1: COMANDA DE COCINA (SOLO PLATOS Y NOTAS, SIN PRECIOS) -->
        <div id="view-kitchen" style="display: ${mode === 'kitchen' ? 'block' : 'none'};">
          <div class="text-center">
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
              ${isAddition ? 'ADICIÓN DE COCINA' : 'COMANDA DE COCINA'}
            </div>
            <div class="badge-mode">${escapeHtml(locationLabel)}</div>
          </div>

          <div class="double-divider"></div>

          <div class="row" style="font-size: 13px; font-weight: 900;">
            <span>ORDEN #${shortId}</span>
            <span>HORA: ${timeStr}</span>
          </div>
          ${!isMesa && order.nombre ? `
          <div class="row" style="font-size: 11px;">
            <span>Cliente:</span>
            <span class="bold">${escapeHtml(order.nombre)}</span>
          </div>` : ''}

          <div class="divider"></div>
          <div class="bold" style="font-size: 11px; text-transform: uppercase; margin-bottom: 6px;">PLATOS SOLICITADOS:</div>

          ${itemsKitchenHtml}

          ${order.comentarios ? `
          <div style="background: #e5e7eb; padding: 6px; border-left: 3px solid #000; margin: 8px 0; font-size: 12px; font-weight: 800;">
            OBSERVACIÓN: ${escapeHtml(order.comentarios)}
          </div>` : ''}

          <div class="double-divider"></div>
          <div class="text-center" style="font-size: 10px; font-weight: 700;">
            FIN DE COMANDA · ${dateStr} ${timeStr}
          </div>
        </div>

        <!-- VISTA 2: CUENTA / RECIBO DE COBRO (PLATOS + PRECIOS + TOTAL) -->
        <div id="view-bill" style="display: ${mode === 'bill' ? 'block' : 'none'};">
          <div class="text-center">
            <div style="font-size: 15px; font-weight: 900; text-transform: uppercase;">${escapeHtml(businessName)}</div>
            ${businessPhone ? `<div style="font-size: 11px;">Tel: ${escapeHtml(businessPhone)}</div>` : ''}
            <div style="font-size: 11px; font-weight: 800; margin-top: 4px; padding: 2px 8px; border: 1px solid #000; display: inline-block; border-radius: 4px;">
              ${escapeHtml(locationLabel)}
            </div>
          </div>

          <div class="divider"></div>

          <div class="row">
            <span class="bold">CUENTA #${shortId}</span>
            <span>${dateStr} ${timeStr}</span>
          </div>
          ${!isMesa ? `
          <div class="row">
            <span>Cliente:</span>
            <span class="bold">${order.nombre || 'Cliente'}</span>
          </div>
          ${order.telefono ? `
          <div class="row">
            <span>Teléfono:</span>
            <span>${escapeHtml(order.telefono)}</span>
          </div>` : ''}
          ${isEnvio ? `
          <div style="margin-top: 3px;">
            <span class="bold">Dirección:</span>
            <div>${order.direccion || 'Sin dirección'}</div>
          </div>` : ''}` : ''}

          <div class="divider"></div>
          <div class="row bold" style="font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">
            <span>DETALLE DEL PEDIDO</span>
            <span>VALOR</span>
          </div>

          ${itemsBillHtml}

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal:</span>
            <span class="bold">$${subtotal.toLocaleString('es-CO')}</span>
          </div>
          ${isEnvio ? `
          <div class="row">
            <span>Domicilio:</span>
            <span>${domCost > 0 ? '$' + domCost.toLocaleString('es-CO') : 'Por confirmar'}</span>
          </div>` : ''}

          <div class="double-divider"></div>
          <div class="row" style="font-size: 15px; font-weight: 900;">
            <span>TOTAL A PAGAR:</span>
            <span>$${total.toLocaleString('es-CO')}</span>
          </div>

          <div class="row" style="margin-top: 6px; font-size: 11px;">
            <span>Método de pago:</span>
            <span class="bold">${escapeHtml(paymentLabel)}</span>
          </div>

          <div class="divider"></div>
          <div class="text-center" style="font-size: 10px; margin-top: 6px;">
            Gracias por su compra en ${escapeHtml(businessName)}
          </div>
        </div>

        <div class="no-print" style="margin-top: 14px; text-align: center;">
          <button onclick="window.print()" style="width: 100%; padding: 9px 16px; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer;">
            Imprimir ahora
          </button>
        </div>

        <script>
          function setMode(m) {
            document.getElementById('view-kitchen').style.display = m === 'kitchen' ? 'block' : 'none';
            document.getElementById('view-bill').style.display = m === 'bill' ? 'block' : 'none';
            document.getElementById('btn-kitchen').className = m === 'kitchen' ? 'active' : '';
            document.getElementById('btn-bill').className = m === 'bill' ? 'active' : '';
          }
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}

