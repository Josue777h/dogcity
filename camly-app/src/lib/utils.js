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
      const optStr = i.opciones_texto ? ` [${i.opciones_texto}]` : '';
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
      `"${(o.nombre || '').replace(/"/g, '""')}"`,
      `"${(o.telefono || '').replace(/"/g, '""')}"`,
      o.entrega_metodo === 'envio' ? 'Domicilio' : 'Retiro en tienda',
      `"${(o.direccion || o.ubicacion_link || '').replace(/"/g, '""')}"`,
      o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo',
      (o.status || o.estado || 'nuevo').toUpperCase(),
      subtotal,
      domCost,
      total,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${(o.comentarios || '').replace(/"/g, '""')}"`
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

  // 1. Si tiene mensaje o campo con estructura de horario
  let schedule = null;
  if (business.horario && typeof business.horario === 'object') {
    schedule = business.horario;
  } else if (typeof business.footer_message === 'string' && business.footer_message.includes('CAMLY_SCHEDULE:')) {
    try {
      const match = business.footer_message.match(/<!--CAMLY_SCHEDULE:(.*?)-->/);
      if (match && match[1]) schedule = JSON.parse(match[1]);
    } catch {
      schedule = null;
    }
  }

  // Si no hay configuración explícita, se asume abierto por defecto
  if (!schedule) {
    return { isOpen: true, message: 'Abierto ahora', mode: 'auto' };
  }

  // Switch manual de cerrado temporal
  if (schedule.abierto_manual === false) {
    return { 
      isOpen: false, 
      message: 'Cerrado temporalmente por el comercio',
      mode: 'manual_closed'
    };
  }

  // Verificación por horario semanal
  const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const now = new Date();
  const currentDay = daysMap[now.getDay()];
  const dayConfig = schedule.dias?.[currentDay];

  if (dayConfig) {
    if (!dayConfig.activo) {
      return { 
        isOpen: false, 
        message: 'Cerrado hoy', 
        nextOpen: 'Abre en su próximo día laboral' 
      };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (dayConfig.abre || '09:00').split(':').map(Number);
    const [closeH, closeM] = (dayConfig.cierra || '22:00').split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Caso horario normal (ej. 10:00 a 22:00)
    if (closeMinutes > openMinutes) {
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return { isOpen: true, message: `Abierto hoy hasta las ${dayConfig.cierra}` };
      } else {
        return { 
          isOpen: false, 
          message: `Cerrado · Horario hoy: ${dayConfig.abre} a ${dayConfig.cierra}` 
        };
      }
    } else {
      // Caso horario nocturno que cruza medianoche (ej. 18:00 a 02:00)
      if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
        return { isOpen: true, message: `Abierto hasta las ${dayConfig.cierra}` };
      } else {
        return { 
          isOpen: false, 
          message: `Cerrado · Abre hoy a las ${dayConfig.abre}` 
        };
      }
    }
  }

}

/**
 * Imprimir comanda de cocina o ticket térmico (58mm / 80mm ESC/POS)
 */
export function printThermalReceipt(order, business) {
  if (!order) return;

  const dateObj = order.created_at ? new Date(order.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const shortId = (order.id || '').toString().slice(-6).toUpperCase();
  const businessName = business?.nombre_visible || business?.nombre || 'Mi Negocio';
  const businessPhone = business?.telefono || '';

  const items = order.items || order.productos || [];
  const subtotal = getOrderSubtotal(order);
  const domCost = Number(order.domicilio_costo) || 0;
  const total = Number(order.total) || (subtotal + domCost);
  const isEnvio = order.entrega_metodo === 'envio';

  const itemsHtml = items.map(p => {
    const qty = p.cantidad ?? p.quantity ?? 1;
    const name = p.nombre ?? p.name ?? 'Producto';
    const price = p.precio ?? p.price ?? 0;
    const itemTotal = price * qty;
    const optText = p.opciones_texto || 
      (Array.isArray(p.opciones) ? p.opciones.map(o => o.nombre).join(', ') : '') ||
      (Array.isArray(p.toppings) ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ') : '');
    const nota = (p.nota || '').trim();

    return `
      <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #bbb;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px;">
          <span>${qty}x ${name}</span>
          <span>$${itemTotal.toLocaleString('es-CO')}</span>
        </div>
        ${optText ? `<div style="font-size: 11px; margin-left: 6px; color: #000; font-weight: bold; margin-top: 2px;">▸ ${optText}</div>` : ''}
        ${nota ? `<div style="font-size: 11px; margin-left: 6px; font-weight: 900; background: #e5e7eb; padding: 2px 4px; border-left: 3px solid #000; margin-top: 3px;">⚠️ NOTA COCINA: ${nota.toUpperCase()}</div>` : ''}
      </div>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) {
    alert('Por favor habilita las ventanas emergentes en tu navegador para imprimir comandas.');
    return;
  }

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket #${shortId} - ${businessName}</title>
        <style>
          @page {
            margin: 0;
            size: auto;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace;
            width: 76mm;
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            background: #fff;
            font-size: 12px;
            line-height: 1.3;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 2px solid #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: bold;
            border: 1px solid #000;
            border-radius: 4px;
            margin-top: 4px;
          }
          @media print {
            body { padding: 4px; width: 100%; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div style="font-size: 16px; font-weight: 900; text-transform: uppercase;">${businessName}</div>
          ${businessPhone ? `<div style="font-size: 11px;">Tel: ${businessPhone}</div>` : ''}
          <div class="badge">${isEnvio ? '🛵 DOMICILIO' : '🏪 RETIRO EN LOCAL'}</div>
        </div>

        <div class="divider"></div>

        <div class="row">
          <span class="bold">ORDEN #${shortId}</span>
          <span>${dateStr} ${timeStr}</span>
        </div>
        <div class="row">
          <span>Cliente:</span>
          <span class="bold">${order.nombre || 'Cliente'}</span>
        </div>
        <div class="row">
          <span>Teléfono:</span>
          <span>${order.telefono || 'Sin teléfono'}</span>
        </div>
        ${isEnvio ? `
        <div style="margin-top: 4px;">
          <span class="bold">Dirección:</span>
          <div>${order.direccion || 'Sin dirección'}</div>
        </div>` : ''}

        <div class="divider"></div>
        <div class="bold" style="font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">PRODUCTOS / COMANDA:</div>

        ${itemsHtml}

        ${order.comentarios ? `
        <div style="background: #f0f0f0; padding: 4px; border-radius: 4px; margin: 6px 0; font-size: 11px;">
          <span class="bold">Observación:</span> ${order.comentarios}
        </div>` : ''}

        <div class="divider"></div>

        <div class="row">
          <span>Subtotal:</span>
          <span>$${subtotal.toLocaleString('es-CO')}</span>
        </div>
        ${isEnvio ? `
        <div class="row">
          <span>Domicilio:</span>
          <span>${domCost > 0 ? '$' + domCost.toLocaleString('es-CO') : 'Pendiente / $0'}</span>
        </div>` : ''}
        
        <div class="double-divider"></div>
        <div class="row" style="font-size: 15px; font-weight: 900;">
          <span>TOTAL:</span>
          <span>$${total.toLocaleString('es-CO')}</span>
        </div>

        <div class="row" style="margin-top: 6px; font-size: 11px;">
          <span>Pago:</span>
          <span class="bold">${order.pago_metodo === 'transferencia' ? 'TRANSFERENCIA' : 'EFECTIVO'}</span>
        </div>

        <div class="divider"></div>
        <div class="text-center" style="font-size: 10px; margin-top: 8px;">
          ¡Gracias por tu pedido!
        </div>

        <div class="no-print" style="margin-top: 15px; text-align: center;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #ea580c; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ Imprimir Ticket
          </button>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}

