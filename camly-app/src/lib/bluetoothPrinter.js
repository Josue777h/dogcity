/**
 * Bluetooth Thermal Printer Manager (ESC/POS vía Web Bluetooth API)
 * Soporta impresoras térmicas portátiles POS-58 / POS-80 (Goojprt, MPT-II, etc.)
 */

import { getOrderSubtotal } from './utils';

// UUIDs comunes de impresoras térmicas BLE
const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ae00-0000-1000-8000-00805f9b34fb'
];

let cachedDevice = null;
let cachedCharacteristic = null;

export function isWebBluetoothSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
}

/**
 * Conectar o reutilizar la conexión con la impresora Bluetooth
 */
export async function connectBluetoothPrinter() {
  if (!isWebBluetoothSupported()) {
    throw new Error('Tu navegador no soporta Web Bluetooth. Puedes usar Google Chrome, Edge o Samsung Internet en Android/PC.');
  }

  // Si ya tenemos una conexión activa
  if (cachedDevice && cachedDevice.gatt && cachedDevice.gatt.connected && cachedCharacteristic) {
    return { device: cachedDevice, characteristic: cachedCharacteristic };
  }

  // Solicitar dispositivo al usuario
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: PRINTER_SERVICES
  });

  const server = await device.gatt.connect();

  // Buscar un servicio y una característica con soporte de escritura
  let targetCharacteristic = null;

  for (const serviceUuid of PRINTER_SERVICES) {
    try {
      const service = await server.getPrimaryService(serviceUuid);
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
      if (targetCharacteristic) break;
    } catch {
      // Probar siguiente servicio
    }
  }

  // Si no se encontró por UUID conocido, explorar todos los servicios primarios
  if (!targetCharacteristic) {
    try {
      const services = await server.getPrimaryServices();
      for (const service of services) {
        try {
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              targetCharacteristic = char;
              break;
            }
          }
          if (targetCharacteristic) break;
        } catch {
          // continuar
        }
      }
    } catch {
      // continuar
    }
  }

  if (!targetCharacteristic) {
    throw new Error('No se encontró canal de escritura en la impresora seleccionada. Verifica que esté encendida y en modo Bluetooth.');
  }

  cachedDevice = device;
  cachedCharacteristic = targetCharacteristic;

  device.addEventListener('gattserverdisconnected', () => {
    cachedDevice = null;
    cachedCharacteristic = null;
  });

  return { device, characteristic: targetCharacteristic };
}

/**
 * Construir comandos ESC/POS binarios para la orden
 * @param {object} order - Datos de la orden
 * @param {object} business - Datos del negocio
 * @param {object} options - { mode: 'kitchen' | 'bill', isAddition: boolean, itemsOverride: Array }
 */
export function buildEscPosCommands(order, business, options = {}) {
  const mode = options.mode === 'kitchen' ? 'kitchen' : 'bill';
  const isKitchen = mode === 'kitchen';
  const isAddition = Boolean(options.isAddition);

  const encoder = new TextEncoder();
  const chunks = [];

  // Comandos ESC/POS
  const ESC = 0x1B;
  const GS = 0x1D;

  const initPrinter = [ESC, 0x40]; // Reset / Init
  const alignCenter = [ESC, 0x61, 0x01];
  const alignLeft = [ESC, 0x61, 0x00];
  const boldOn = [ESC, 0x45, 0x01];
  const boldOff = [ESC, 0x45, 0x00];
  const doubleSize = [GS, 0x21, 0x11];
  const normalSize = [GS, 0x21, 0x00];
  const lineFeed = [0x0A];
  const cutPaper = [GS, 0x56, 0x41, 0x10]; // Feed & Partial cut

  function addText(text) {
    // Normalizar tildes y caracteres especiales a ASCII legible en ESC/POS
    const clean = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
    chunks.push(encoder.encode(clean));
  }

  function addRaw(bytes) {
    chunks.push(new Uint8Array(bytes));
  }

  const shortId = (order.id || '').toString().slice(-6).toUpperCase();
  const businessName = business?.nombre_visible || business?.nombre || 'Mi Negocio';
  const businessPhone = business?.telefono || '';
  const dateObj = order.created_at ? new Date(order.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('es-CO');
  const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const isMesa = order.delivery_type === 'dine_in' || order.entrega_metodo === 'mesa' || (typeof order.direccion === 'string' && /mesa/i.test(order.direccion)) || Boolean(order.mesa || order.table_number);
  const tableNum = String(order.mesa || order.table_number || '').trim() || ((order.direccion || '').match(/mesa\s*#?\s*([a-zA-Z0-9_-]+)/i)?.[1] || '');
  const isEnvio = !isMesa && (order.entrega_metodo === 'envio' || order.delivery_type === 'delivery');

  const items = Array.isArray(options.itemsOverride) && options.itemsOverride.length > 0
    ? options.itemsOverride
    : (order.items || order.productos || []);
  const subtotal = getOrderSubtotal(order);
  const domCost = Number(order.domicilio_costo ?? order.delivery_fee) || 0;
  const total = Number(order.total_amount ?? order.total) || (subtotal + domCost);

  // Inicializar
  addRaw(initPrinter);

  // Encabezado según el tipo de ticket
  addRaw(alignCenter);
  if (isKitchen) {
    addRaw(doubleSize);
    addRaw(boldOn);
    addText((isAddition ? 'ADICION DE COCINA' : 'COMANDA DE COCINA') + '\n');
    addRaw(normalSize);
    addRaw(boldOff);
    addText(businessName.toUpperCase() + '\n');
  } else {
    addRaw(doubleSize);
    addRaw(boldOn);
    addText(businessName.toUpperCase() + '\n');
    addRaw(normalSize);
    addRaw(boldOff);
    if (businessPhone) {
      addText(`Tel: ${businessPhone}\n`);
    }
    addText('CUENTA / RECIBO DE PAGO\n');
  }

  if (isMesa) {
    addRaw(doubleSize);
    addRaw(boldOn);
    addText(`MESA #${tableNum || '1'}\n`);
    addRaw(normalSize);
    addRaw(boldOff);
  } else if (isEnvio) {
    addRaw(boldOn);
    addText('DOMICILIO\n');
    addRaw(boldOff);
  } else {
    addRaw(boldOn);
    addText('RETIRO EN LOCAL\n');
    addRaw(boldOff);
  }
  addText('--------------------------------\n');

  // Datos orden
  addRaw(alignLeft);
  addText(`ORDEN: #${shortId}\n`);
  addText(`HORA: ${dateStr} ${timeStr}\n`);
  if (!isKitchen) {
    addText(`CLIENTE: ${order.nombre || 'Cliente'}\n`);
    if (!isMesa && order.telefono) {
      addText(`TEL: ${order.telefono}\n`);
    }
    if (isEnvio && order.direccion) {
      addText(`DIR: ${order.direccion}\n`);
    }
  }
  addText('--------------------------------\n');

  // Items
  addRaw(boldOn);
  addText(isKitchen ? 'PREPARACION:\n' : 'DETALLE DE CONSUMO:\n');
  addRaw(boldOff);

  items.forEach(p => {
    const qty = p.cantidad ?? p.quantity ?? 1;
    const name = p.nombre ?? p.name ?? 'Producto';
    const price = p.precio ?? p.price ?? 0;
    const itemTotal = price * qty;
    const optText = p.opciones_texto || (Array.isArray(p.opciones) ? p.opciones.map(t => typeof t === 'string' ? t : (t.nombre || t.label)).join(', ') : '') || (Array.isArray(p.toppings) ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ') : '');
    const nota = p.nota || p.note || '';

    addRaw(boldOn);
    if (isKitchen) {
      addText(`${qty} x ${name.toUpperCase()}\n`);
    } else {
      addText(`${qty}x ${name} - $${itemTotal.toLocaleString('es-CO')}\n`);
    }
    addRaw(boldOff);

    if (optText) {
      addText(`  + ${optText}\n`);
    }
    if (nota) {
      addRaw(boldOn);
      addText(`  NOTA: ${nota}\n`);
      addRaw(boldOff);
    }
    addText('\n');
  });

  if (order.comentarios && order.comentarios !== 'Comanda de salón') {
    addRaw(boldOn);
    addText(`OBS: ${order.comentarios}\n`);
    addRaw(boldOff);
  }

  addText('--------------------------------\n');

  // Totales únicamente en Cuenta / Cobro
  if (!isKitchen) {
    addText(`Subtotal: $${subtotal.toLocaleString('es-CO')}\n`);
    if (isEnvio) {
      addText(`Domicilio: $${domCost.toLocaleString('es-CO')}\n`);
    }
    addRaw(boldOn);
    addRaw(doubleSize);
    addText(`TOTAL: $${total.toLocaleString('es-CO')}\n`);
    addRaw(normalSize);
    addRaw(boldOff);

    const paymentLabel = isMesa
      ? 'PAGO EN CAJA / MESA'
      : order.pago_metodo === 'transferencia'
        ? 'TRANSFERENCIA'
        : 'EFECTIVO';
    addText(`Pago: ${paymentLabel}\n`);
    addText('--------------------------------\n');

    addRaw(alignCenter);
    addText('Gracias por su visita!\n');
  } else {
    addRaw(alignCenter);
    addText('--- FIN DE COMANDA ---\n');
  }

  addRaw(lineFeed);
  addRaw(lineFeed);
  addRaw(lineFeed);
  addRaw(cutPaper);

  // Concatenar todos los chunks en un solo Uint8Array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }

  return result;
}

/**
 * Enviar comanda o cuenta directamente a la impresora Bluetooth conectada
 */
export async function printOrderViaBluetooth(order, business, options = {}) {
  const { device, characteristic } = await connectBluetoothPrinter();
  const buffer = buildEscPosCommands(order, business, options);

  // Escribir en fragmentos pequeños (MTU BLE suele ser ~20 a 100 bytes)
  const CHUNK_SIZE = 64;
  for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
    const chunk = buffer.slice(i, i + CHUNK_SIZE);
    if (characteristic.writeValueWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    // Pequeño retardo para no saturar el buffer de la impresora
    await new Promise(r => setTimeout(r, 25));
  }

  return device.name || 'Impresora Térmica';
}
