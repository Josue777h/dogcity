import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import {
  User, Phone, MapPin, Navigation, Copy, Check, X, Wallet, ShoppingBag, Truck,
  CheckCircle2, Minus, Plus, CreditCard, AlertCircle, Smartphone, Utensils, Store
} from 'lucide-react';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';
import { formatMoney, formatThousandsInput, openWhatsApp, reverseGeocode, formatWhatsAppMessage, formatGroupedOptionsText, getGroupedOptionsList } from '../../lib/utils';
import { saveOrder } from '../../lib/supabase';
import { WHATSAPP_FALLBACK_PHONE } from '../../lib/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';

function generateOrderToken() {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  }
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function broadcastNewOrderEvent(bid, orderId) {
  if (typeof window === 'undefined') return;
  try {
    const bc = new BroadcastChannel('negu_orders_channel');
    bc.postMessage({ type: 'NEW_ORDER', orderId, negocioId: bid });
    bc.close();
  } catch (err) {
    console.debug('BroadcastChannel unavailable:', err);
  }
  try {
    localStorage.setItem('negu_latest_order_event', JSON.stringify({ bid, orderId, timestamp: Date.now() }));
  } catch (err) {
    console.debug('localStorage unavailable:', err);
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const LocationPickerMap = lazy(() => import('./components/LocationPickerMap'));

// ── WhatsApp icon SVG ──
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function OrderDrawer({ isOpen, onClose, scheduleStatus, tableNumber = '' }) {
  const business  = useBusinessStore(s => s.business);
  const products  = useBusinessStore(s => s.products);
  const bid       = business?.id;
  const addToast  = useToastStore(s => s.addToast);

  const {
    carts, customerName, customerPhone, customerAddress,
    locationLink, locationLabel, setCustomer, setLocation, setComment,
    getSelectedItems, clearCart, increment, decrement
  } = useCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState(() => tableNumber ? 'mesa' : 'envio');
  const [paymentMethod,  setPaymentMethod]  = useState('');
  const [cashPaidWith,   setCashPaidWith]   = useState('');

  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [orderResult,    setOrderResult]    = useState(null);
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [mapCoords,      setMapCoords]      = useState(null);
  const [deliveryFee,    setDeliveryFee]    = useState(0);
  const [distanceKm,     setDistanceKm]     = useState(null);

  const submittingRef   = useRef(false);
  const pendingOrderRef = useRef({ signature: '', token: '' });

  const tipoDom          = business?.tipo_domicilio || 'automatico';
  const fixedDeliveryFee = Math.max(0, Number(business?.precio_domicilio ?? 0));
  const minDeliveryFee   = Math.max(0, Number(business?.domicilio_minimo ?? 3000));
  const costPerKm        = Math.max(0, Number(business?.costo_por_km ?? 1200));
  const effectiveDeliveryFee = deliveryMethod !== 'envio'
    ? 0
    : tipoDom === 'fijo'
      ? fixedDeliveryFee
      : tipoDom === 'manual'
        ? 0
        : deliveryFee;

  const cart           = carts[bid] || { quantities: {}, notes: {}, comment: '' };
  const selectedItems  = getSelectedItems(bid, products);
  const subtotal       = selectedItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const total          = deliveryMethod === 'envio' ? subtotal + effectiveDeliveryFee : subtotal;
  const whatsappPhone  = (business?.whatsapp_contacto || business?.telefono || WHATSAPP_FALLBACK_PHONE).replace(/\D/g, '');

  const resetTransientState = useCallback(() => {
    setOrderResult(null);
    setLocation('', '');
    setDeliveryMethod(tableNumber ? 'mesa' : 'envio');
    setPaymentMethod('');
    setCashPaidWith('');
    setDeliveryFee(0);
    setDistanceKm(null);
    setMapCoords(null);
    pendingOrderRef.current = { signature: '', token: '' };
  }, [setLocation, tableNumber]);

  const handleClose = useCallback(() => {
    resetTransientState();
    onClose();
  }, [resetTransientState, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!bid) return null;

  function buildMessage(orderId, token) {
    const bizName    = (business?.nombre_visible || 'la tienda').trim();
    const quotePending = tipoDom === 'manual' && deliveryMethod === 'envio';
    const itemsLines = selectedItems.flatMap(i => {
      const note = (i.note || cart.notes?.[i.id] || '').trim();
      const optGroups = getGroupedOptionsList(i.options, i.opciones_texto || '', { includePrice: true });
      const optLines = optGroups.map(g => (g.title ? `  ◦ *${g.title}:* ${g.value}` : `  ◦ _${g.value}_`));
      return [
        `• *${i.quantity} × ${i.name}* — ${formatMoney(i.price * i.quantity)}`,
        ...optLines,
        ...(note ? [`  _Nota: ${note}_`] : []),
      ];
    });

    const trackingUrl = `${window.location.origin}/tracking/${orderId}?token=${encodeURIComponent(token)}`;
    const addressLine = customerAddress?.trim() || (locationLink ? 'Ver ubicación GPS en el mapa' : 'No especificada');

    const sections = [
      { title: 'Detalle del pedido', lines: itemsLines },
    ];

    const isMesa = Boolean((tableNumber && String(tableNumber).trim()) || deliveryMethod === 'mesa');
    const tableVal = (tableNumber || (typeof deliveryMethod === 'string' && deliveryMethod.match(/\d+/)?.[0]) || '1').toString().trim();

    if (isMesa) {
      sections.push({
        title: 'Servicio en el local',
        lines: [`• Modalidad: Mesa #${tableVal}`]
      });
    } else if (deliveryMethod === 'envio') {
      sections.push({
        title: 'Entrega a domicilio',
        lines: [
          `• Dirección: ${addressLine}`,
          locationLink ? `• Mapa GPS: ${locationLink}` : '',
          `• Domicilio: ${quotePending ? 'Pendiente por cotizar' : (effectiveDeliveryFee === 0 ? 'Gratis' : formatMoney(effectiveDeliveryFee))}`
        ].filter(Boolean)
      });
    } else {
      sections.push({
        title: 'Recogida en tienda',
        lines: [
          '• Modalidad: Paso a recoger en el local',
          business?.direccion?.trim() ? `• Dirección del local: ${business.direccion.trim()}` : '',
        ].filter(Boolean)
      });
    }

    const trimmedCash = cashPaidWith.trim();
    const cashPaymentLabel = trimmedCash
      ? (trimmedCash.toLowerCase() === 'exacto'
          ? 'Efectivo (Pago exacto)'
          : `Efectivo (Paga con ${trimmedCash})`)
      : 'Efectivo';

    sections.push({
      title: 'Resumen y pago',
      lines: [
        `• Subtotal productos: ${formatMoney(subtotal)}`,
        deliveryMethod === 'envio' && !quotePending ? `• Domicilio: ${effectiveDeliveryFee === 0 ? 'Gratis' : formatMoney(effectiveDeliveryFee)}` : '',
        quotePending
          ? `• *Total productos:* ${formatMoney(subtotal)} (+ envío por confirmar)`
          : `• *Total a pagar:* ${formatMoney(total)}`,
        `• Forma de pago: ${paymentMethod === 'transferencia' ? `Transferencia (${business?.pago_banco || 'Cuenta del comercio'})` : paymentMethod === 'datafono' ? 'Datáfono' : cashPaymentLabel}`,
      ].filter(Boolean)
    });

    sections.push({
      title: 'Datos del cliente',
      lines: [
        `• Nombre: ${customerName}`,
        customerPhone?.trim() ? `• Teléfono: ${customerPhone}` : (tableNumber ? '• Contacto: En mesa' : ''),
        cart.comment ? `• Comentario: ${cart.comment}` : ''
      ].filter(Boolean)
    });

    if (!quotePending) {
      sections.push({
        title: 'Seguimiento en línea',
        lines: ['Sigue el estado de tu pedido aquí:', trackingUrl]
      });
    }

    const shortCode = String(orderId).slice(-6).toUpperCase();
    return formatWhatsAppMessage(
      `Pedido #${shortCode} · ${bizName}`,
      sections,
      `Hola *${bizName}*, quiero realizar el siguiente pedido:`
    );
  }

  function updateLocationFromCoords(lat, lng, label = 'Ubicación ajustada') {
    const validLat = parseFloat(lat);
    const validLng = parseFloat(lng);
    if (!Number.isFinite(validLat) || !Number.isFinite(validLng)) return;

    try {
      setLocation(`https://maps.google.com/?q=${validLat},${validLng}`, label);
      setMapCoords({ lat: validLat, lng: validLng });

      if (!customerAddress?.trim()) {
        reverseGeocode(validLat, validLng)
          .then(addr => { if (addr) setCustomer('customerAddress', addr); })
          .catch(() => {});
      }

      const bizLat = parseFloat(business?.lat);
      const bizLng = parseFloat(business?.lng);
      const hasBizCoords = Number.isFinite(bizLat) && Number.isFinite(bizLng);

      if (tipoDom === 'fijo') {
        setDistanceKm(null);
        setDeliveryFee(fixedDeliveryFee);
      } else if (tipoDom === 'manual') {
        setDistanceKm(null);
        setDeliveryFee(0);
      } else {
        let dist = null;
        if (hasBizCoords) {
          try {
            dist = calculateDistance(bizLat, bizLng, validLat, validLng);
          } catch {
            dist = null;
          }
        }
        setDistanceKm(dist);
        const calculatedFee = dist !== null
          ? Math.max(minDeliveryFee, Math.round((dist * costPerKm) / 100) * 100)
          : minDeliveryFee;
        setDeliveryFee(calculatedFee);
      }
    } catch (err) {
      console.warn('Error en updateLocationFromCoords:', err);
    }
  }

  function openManualMapPicker() {
    const bizLat = parseFloat(business?.lat);
    const bizLng = parseFloat(business?.lng);
    const initialLat = Number.isFinite(bizLat) ? bizLat : 7.89391;
    const initialLng = Number.isFinite(bizLng) ? bizLng : -72.50782;
    updateLocationFromCoords(initialLat, initialLng, 'Pin en mapa');
    addToast('Toca el mapa o arrastra el pin rojo hasta tu punto de entrega', 'info');
  }

  function requestGps() {
    if (typeof window === 'undefined' || !navigator?.geolocation) {
      addToast('GPS no disponible en este dispositivo o navegador', 'error');
      return;
    }
    setIsCalculating(true);
    try {
      navigator.geolocation.getCurrentPosition(
        pos => {
          try {
            if (pos?.coords) {
              const { latitude, longitude } = pos.coords;
              if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
                updateLocationFromCoords(latitude, longitude, 'GPS capturado');
                addToast('Ubicación GPS capturada con éxito', 'success');
              } else {
                addToast('Coordenadas GPS no válidas', 'warning');
              }
            }
          } catch (e) {
            console.warn('Error al procesar ubicación GPS:', e);
            addToast('Error al leer coordenadas GPS', 'error');
          } finally {
            setIsCalculating(false);
          }
        },
        err => {
          let msg = 'No se pudo acceder al GPS. Asegúrate de permitir el acceso a tu ubicación.';
          if (err?.code === 1) msg = 'Permiso de ubicación denegado. Actívalo en los permisos del navegador.';
          else if (err?.code === 2) msg = 'Ubicación no disponible en este momento. Intenta de nuevo.';
          else if (err?.code === 3) msg = 'Tiempo de espera agotado al leer el GPS. Vuelve a tocar el botón.';
          addToast(msg, 'warning');
          setIsCalculating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      console.warn('Error al solicitar GPS:', e);
      addToast('Error al iniciar el servicio GPS', 'error');
      setIsCalculating(false);
    }
  }

  function handleCopyAccount() {
    const val = (business?.pago_alias || business?.pago_banco || '').trim();
    if (!val) { addToast('No hay datos bancarios configurados', 'warning'); return; }
    navigator.clipboard.writeText(val);
    setHasCopiedAccount(true);
    addToast('Número copiado', 'success');
    setTimeout(() => setHasCopiedAccount(false), 2500);
  }

  async function handleSubmit() {
    if (submittingRef.current) return;
    if (selectedItems.length === 0)  { addToast('Agrega al menos un producto', 'warning'); return; }
    if (!deliveryMethod && !tableNumber) { addToast('Elige cómo recibir tu pedido', 'warning'); return; }
    if (!customerName.trim())        { addToast(tableNumber ? '¿A nombre de quién llevamos la orden?' : '¿Cuál es tu nombre?', 'warning'); return; }
    if (!tableNumber && !customerPhone.trim()) { addToast('¿Cuál es tu teléfono?', 'warning'); return; }
    if (deliveryMethod === 'envio') {
      if (tipoDom === 'automatico' && !locationLink) {
        addToast('Activa tu GPS o toca "Ubicar en mapa" para calcular el envío', 'warning');
        openManualMapPicker();
        return;
      }
      if ((tipoDom === 'fijo' || tipoDom === 'manual') && !customerAddress.trim() && !locationLink) {
        addToast('Escribe tu dirección o marca tu ubicación en el mapa', 'warning');
        return;
      }
    }
    if (!paymentMethod)              { addToast('Selecciona la forma de pago', 'warning'); return; }

    if (!bid) {
      addToast('No se identificó el negocio activo. Por favor recarga el catálogo.', 'error');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const isMesa = Boolean((tableNumber && String(tableNumber).trim()) || deliveryMethod === 'mesa');
      const tableVal = (tableNumber || (typeof deliveryMethod === 'string' && deliveryMethod.match(/\d+/)?.[0]) || '1').toString().trim();
      const effectiveDeliveryMethod = isMesa ? 'mesa' : (deliveryMethod || 'envio');
      const isCustomQuote = !isMesa && effectiveDeliveryMethod === 'envio' && tipoDom === 'manual';
      const initialStatus = isCustomQuote ? 'COTIZACION_PENDIENTE' : 'nuevo';
      const effectiveDeliveryType = isMesa
        ? 'dine_in'
        : effectiveDeliveryMethod === 'recogida'
          ? 'pickup'
          : isCustomQuote
            ? 'custom_quote'
            : tipoDom === 'fijo'
              ? 'fixed'
              : 'per_km';

      const effectiveAddress = isMesa
        ? `Servicio en Mesa ${tableVal}`
        : (effectiveDeliveryMethod === 'envio' ? (customerAddress?.trim() || locationLink || 'Dirección no especificada') : 'Retiro en local');

      const orderSignature = JSON.stringify({
        bid,
        items: selectedItems.map(i => [i.id, i.quantity, i.price, i.opciones_texto, i.note]),
        effectiveDeliveryMethod,
        paymentMethod,
        total: isMesa ? subtotal : total,
        effectiveAddress,
        locationLink: isMesa ? '' : locationLink,
      });
      if (pendingOrderRef.current.signature !== orderSignature || !pendingOrderRef.current.token) {
        pendingOrderRef.current = { signature: orderSignature, token: generateOrderToken() };
      }
      const token = pendingOrderRef.current.token;

      const baseComment = (cart.comment || '').trim();
      const trimmedCash = cashPaidWith.trim();
      const cashNote = paymentMethod === 'efectivo' && trimmedCash
        ? (trimmedCash.toLowerCase() === 'exacto' ? 'Pago en efectivo exacto' : `Paga en efectivo con ${trimmedCash}`)
        : '';
      const finalComments = [baseComment, cashNote].filter(Boolean).join(' · ');

      const payload = {
        nombre: customerName.trim(),
        telefono: customerPhone.trim() || (isMesa ? 'En mesa' : ''),
        direccion: effectiveAddress,
        ubicacion_link: isMesa ? null : locationLink,
        comentarios: finalComments,
        total: isMesa ? subtotal : total,
        total_amount: isMesa ? subtotal : total,
        subtotal_amount: subtotal,
        domicilio_costo: isMesa ? 0 : (effectiveDeliveryMethod === 'envio' ? effectiveDeliveryFee : 0),
        delivery_fee: isMesa ? 0 : (effectiveDeliveryMethod === 'envio' ? effectiveDeliveryFee : 0),
        distancia_km: isMesa ? null : distanceKm,
        status: initialStatus,
        estado: initialStatus,
        delivery_type: effectiveDeliveryType,
        items: selectedItems.map(i => ({
          id: i.id, nombre: i.name, cantidad: i.quantity, precio: i.price,
          nota: (i.note || cart.notes?.[i.id] || '').trim(),
          opciones_texto: i.opciones_texto || '',
          opciones: i.options || []
        })),
        entrega_metodo: effectiveDeliveryMethod,
        pago_metodo: paymentMethod,
        payment_method: paymentMethod === 'transferencia'
          ? (/daviplata/i.test(business?.pago_banco || '') ? 'transfer_daviplata'
            : /bancolombia/i.test(business?.pago_banco || '') ? 'transfer_bancolombia'
              : 'transfer_nequi')
          : paymentMethod === 'datafono' ? 'card_terminal' : 'cash',
        payment_status: 'pending',
        token,
        negocio_id: bid,
      };

      const orderId = await saveOrder(payload);
      if (!orderId) throw new Error('Error al guardar el pedido');

      const message = buildMessage(orderId, token);
      pendingOrderRef.current = { signature: '', token: '' };
      setOrderResult({ id: orderId, message, token });
      addToast(`Pedido #${orderId.toString().slice(-6).toUpperCase()} generado`, 'success');
      if (navigator.vibrate) navigator.vibrate(80);
      clearCart(bid);
      setLocation('', '');
      setCashPaidWith('');

      // Notificar al panel administrativo instantáneamente (incluso entre pestañas del navegador)
      broadcastNewOrderEvent(bid, orderId);

      setTimeout(() => {
        openWhatsApp(whatsappPhone, message);
      }, 800);
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const enabledPayments = Array.isArray(business?.metodos_pago) ? business.metodos_pago : ['efectivo', 'transferencia'];

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Carrito y finalizar pedido"
      className={`fixed inset-0 z-[100] ${isOpen ? 'visible' : 'invisible'}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 rounded-t-3xl lg:rounded-none
          lg:top-0 lg:bottom-0 lg:right-0 lg:left-auto lg:w-[450px]
          h-[92dvh] max-h-[92dvh] lg:h-full lg:max-h-none
          flex flex-col z-10 transition-transform duration-300
          ${isOpen
            ? 'translate-y-0 lg:translate-x-0'
            : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
          }
        `}
        style={{
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-overlay)'
        }}
      >
        {/* Drag handle (mobile) */}
        <div
          className="w-10 h-1 rounded-full mx-auto mt-2.5 mb-1 shrink-0 lg:hidden"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        {/* Header */}
        <div
          className="px-4 py-3 sm:px-5 sm:py-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-brand)', color: '#fff' }}
            >
              <ShoppingBag size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--color-text-1)' }}>
                {tableNumber ? `Finalizar orden (Mesa ${tableNumber})` : 'Finalizar pedido'}
              </h2>
              <p className="text-[11px] sm:text-xs" style={{ color: 'var(--color-text-2)' }}>
                {tableNumber ? 'Servicio directo a tu mesa' : 'Se enviará por WhatsApp'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-ghost p-1.5 sm:p-2" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4 space-y-4 sm:space-y-5 hide-scrollbar">

          {/* ── SUCCESS STATE ── */}
          {orderResult ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-scale-in">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-success-bg)' }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-1)' }}>
                ¡Pedido enviado!
              </h3>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-2)' }}>
                Pedido #{orderResult.id.toString().slice(-6).toUpperCase()}
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
                Abriendo WhatsApp en un momento…
              </p>

              <div className="space-y-2.5 w-full">
                <button
                  onClick={() => openWhatsApp(whatsappPhone, orderResult.message)}
                  className="btn-whatsapp w-full py-3"
                >
                  <WhatsAppIcon size={20} />
                  Abrir WhatsApp
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(orderResult.message); addToast('Mensaje copiado', 'success'); }}
                  className="btn-secondary w-full py-2.5 text-sm"
                >
                  <Copy size={15} /> Copiar mensaje
                </button>
                <button
                  onClick={handleClose}
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-center mt-2"
                >
                  Hacer otro pedido / Volver al menú
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── ITEMS SUMMARY ── */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="caps-label">Tu pedido</p>
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--color-text-3)' }}>
                    {selectedItems.length} {selectedItems.length === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {selectedItems.length === 0 ? (
                    <p className="p-4 text-sm text-center" style={{ color: 'var(--color-text-2)' }}>
                      El carrito está vacío
                    </p>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto overscroll-contain divide-y divide-slate-200/80">
                        {selectedItems.map((item, idx) => (
                          <div key={item.cartItemId || `${item.id}_${idx}`} className="flex items-start justify-between gap-3 px-3.5 py-3">
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 break-words text-sm font-bold leading-snug text-slate-900">
                                {item.name}
                              </p>
                              {(item.opciones_cliente || item.opciones_texto) && (
                                <p className="mt-1 break-words text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                                  {item.opciones_cliente || formatGroupedOptionsText(item.options, item.opciones_texto || '', { includePrice: true, includeGroupTitle: false })}
                                </p>
                              )}
                              {(item.note || cart.notes?.[item.id]) && (
                                <p className="mt-1 line-clamp-2 break-words text-xs italic text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                                  Nota: {item.note || cart.notes?.[item.id]}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span className="text-sm font-extrabold tabular-nums text-slate-900 whitespace-nowrap shrink-0">
                                {formatMoney(item.quantity * item.price)}
                              </span>
                              {/* Stepper */}
                              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => decrement(bid, item.cartItemId || item.id)}
                                  className="h-8 w-8 flex items-center justify-center text-slate-700 transition-colors hover:bg-slate-200/70 active:scale-95 cursor-pointer"
                                  aria-label="Restar una unidad"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-7 text-center text-xs font-bold tabular-nums text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => increment(bid, item.cartItemId || item.id)}
                                  className="h-8 w-8 flex items-center justify-center text-emerald-700 transition-colors hover:bg-slate-200/70 active:scale-95 cursor-pointer"
                                  aria-label="Sumar una unidad"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Subtotal row */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-t border-slate-200/80">
                        <span className="text-sm font-medium text-slate-600">Subtotal</span>
                        <span className="text-sm font-bold tabular-nums text-slate-900 shrink-0">
                          {formatMoney(subtotal)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── DELIVERY + DATA ── */}
              <div>
                <p className="caps-label mb-2">
                  {tableNumber ? 'Servicio a la mesa' : 'Datos de entrega'}
                </p>
                <div className="space-y-3">
                  {/* Si es mesa, tarjeta exclusiva y elegante; si no, selector de envío / recogida */}
                  {tableNumber ? (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-400 font-bold">
                          <Utensils size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-white">Mesa #{tableNumber}</p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              En sala
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 truncate mt-0.5">Llevaremos tu pedido directamente a tu mesa</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          id: 'envio',
                          label: 'A domicilio',
                          desc: tipoDom === 'fijo'
                            ? (fixedDeliveryFee === 0 ? 'Envío gratis' : formatMoney(fixedDeliveryFee))
                            : tipoDom === 'manual'
                              ? 'Por cotizar'
                              : 'Según distancia',
                          icon: Truck,
                        },
                        { id: 'recogida', label: 'Recoger en local', desc: 'Envío $0 · En tienda', icon: ShoppingBag },
                      ].map(m => {
                        const isSelectedMethod = deliveryMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setDeliveryMethod(m.id);
                              if (m.id === 'recogida') {
                                setLocation('', '');
                                setDeliveryFee(0);
                                setDistanceKm(null);
                                setMapCoords(null);
                              }
                            }}
                            className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all active:scale-95 cursor-pointer min-h-[82px] ${
                              isSelectedMethod
                                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs ring-1 ring-emerald-500/25'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`absolute right-2 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelectedMethod
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelectedMethod && <Check size={11} strokeWidth={3.5} />}
                            </span>
                            <m.icon
                              size={22}
                              strokeWidth={isSelectedMethod ? 2.2 : 1.75}
                              className={isSelectedMethod ? 'text-emerald-700' : 'text-slate-500'}
                            />
                            <div>
                              <span className="block text-xs sm:text-sm font-bold leading-tight">
                                {m.label}
                              </span>
                              <span className={`block text-[10px] mt-0.5 ${isSelectedMethod ? 'text-emerald-800 font-medium' : 'text-slate-400'}`}>
                                {m.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Name */}
                  <div className="relative">
                    <label htmlFor="order-customer-name" className="sr-only">Nombre completo</label>
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                    <input
                      id="order-customer-name"
                      type="text"
                      placeholder={tableNumber ? "¿A nombre de quién llevamos el pedido?" : "Tu nombre"}
                      value={customerName}
                      onChange={e => setCustomer('customerName', e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label htmlFor="order-customer-phone" className="sr-only">Teléfono o WhatsApp</label>
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                    <input
                      id="order-customer-phone"
                      type="tel"
                      placeholder={tableNumber ? "Teléfono o WhatsApp (opcional)" : "Tu teléfono / WhatsApp"}
                      value={customerPhone}
                      onChange={e => setCustomer('customerPhone', e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>

                  {/* Pickup store info */}
                  {deliveryMethod === 'recogida' && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Store size={15} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-900">Pasas a recoger en tienda</p>
                          <span className="font-bold text-emerald-700 shrink-0">Envío: $0</span>
                        </div>
                        <p className="text-slate-600 break-words">
                          {business?.direccion?.trim()
                            ? `Dirección: ${business.direccion.trim()}`
                            : 'Solicita la dirección exacta por WhatsApp al confirmar tu pedido.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Address + map (envio only) */}
                  {deliveryMethod === 'envio' && (
                    <div className="space-y-2">
                      <div className="relative">
                        <label htmlFor="order-customer-address" className="sr-only">Dirección de entrega</label>
                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                        <input
                          id="order-customer-address"
                          type="text"
                          placeholder="Dirección, barrio o punto de referencia"
                          value={customerAddress}
                          onChange={e => setCustomer('customerAddress', e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>

                      {/* GPS / Map Banner Status */}
                      {!locationLink ? (
                        <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200 space-y-2.5">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-brand flex items-center justify-center shrink-0 mt-0.5">
                              <MapPin size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 leading-tight">
                                {tipoDom === 'automatico'
                                  ? 'Ubica tu dirección para calcular el envío'
                                  : 'Ubicación para tu entrega'}
                              </p>
                              <p className="text-[11px] text-gray-600 mt-0.5">
                                {tipoDom === 'automatico'
                                  ? 'Usa tu GPS actual o marca el punto exacto en el mapa.'
                                  : 'Opcional si ya escribiste tu dirección, o márcala en el mapa.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={requestGps}
                              disabled={isCalculating}
                              className="btn-primary py-1.5 px-3 text-xs font-bold gap-1.5 rounded-lg flex-1 min-w-[130px] shadow-xs"
                            >
                              {isCalculating ? <LoadingSpinner size={12} /> : <Navigation size={12} />}
                              <span>{isCalculating ? 'Leyendo GPS...' : 'Usar mi GPS'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={openManualMapPicker}
                              disabled={isCalculating}
                              className="btn-secondary py-1.5 px-3 text-xs font-semibold gap-1.5 rounded-lg flex-1 min-w-[130px]"
                            >
                              <MapPin size={12} />
                              <span>Ubicar en mapa</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                          locationLabel === 'Pin en mapa'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-emerald-50 border-emerald-200'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            {locationLabel === 'Pin en mapa' ? (
                              <MapPin size={16} className="text-amber-600 shrink-0" />
                            ) : (
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            )}
                            <span className={`font-semibold truncate ${
                              locationLabel === 'Pin en mapa' ? 'text-amber-900' : 'text-emerald-800'
                            }`}>
                              {locationLabel === 'Pin en mapa'
                                ? 'Arrastra el pin o toca el mapa en tu dirección'
                                : 'Ubicación confirmada en el mapa'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={requestGps}
                            disabled={isCalculating}
                            className={`text-[11px] font-bold underline shrink-0 ${
                              locationLabel === 'Pin en mapa'
                                ? 'text-amber-800 hover:text-amber-950'
                                : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                          >
                            Usar GPS
                          </button>
                        </div>
                      )}

                      {/* Map header */}
                      {locationLink && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>
                            Punto de entrega en el mapa
                          </p>
                          <button
                            type="button"
                            onClick={requestGps}
                            disabled={isCalculating}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                              backgroundColor: 'var(--color-brand-light)',
                              color: 'var(--color-brand)',
                            }}
                          >
                            {isCalculating ? <LoadingSpinner size={12} /> : <Navigation size={12} />}
                            Recalcular GPS
                          </button>
                        </div>
                      )}

                      {/* Map - rendered ONLY when customer GPS is captured */}
                      {mapCoords && locationLink && (
                        <ErrorBoundary
                          fallback={
                            <div className="p-3 my-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-emerald-900 leading-tight">Ubicación GPS registrada</p>
                                  <p className="text-[11px] text-emerald-700 truncate">Punto de entrega guardado con éxito</p>
                                </div>
                              </div>
                              <a
                                href={locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-sky-600 underline text-xs shrink-0 hover:text-sky-800"
                              >
                                Ver mapa
                              </a>
                            </div>
                          }
                        >
                          <Suspense
                            fallback={
                              <div
                                className="h-48 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                              >
                                <LoadingSpinner size={20} style={{ color: 'var(--color-brand)' }} />
                              </div>
                            }
                          >
                            <LocationPickerMap
                              lat={mapCoords.lat}
                              lng={mapCoords.lng}
                              onLocationChange={(lat, lng) => updateLocationFromCoords(lat, lng, 'Pin ajustado')}
                              onGpsClick={requestGps}
                            />
                          </Suspense>
                        </ErrorBoundary>
                      )}

                      {/* Delivery fee */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck size={14} style={{ color: 'var(--color-brand)' }} />
                          <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>Costo de envío</span>
                          {tipoDom === 'automatico' && distanceKm !== null && (
                            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                              · {distanceKm.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                          {tipoDom === 'manual'
                            ? 'A confirmar'
                            : tipoDom === 'fijo'
                              ? (effectiveDeliveryFee === 0 ? 'Gratis ($0)' : formatMoney(effectiveDeliveryFee))
                              : !locationLink
                                ? (minDeliveryFee > 0 ? `Desde ${formatMoney(minDeliveryFee)}` : 'Según ubicación')
                                : formatMoney(effectiveDeliveryFee)
                          }
                        </span>
                      </div>

                      {tipoDom === 'manual' && (
                        <p
                          className="text-xs px-1"
                          style={{ color: 'var(--color-text-3)' }}
                        >
                          El negocio te confirmará el costo exacto por WhatsApp.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── PAYMENT ── */}
              <div>
                <p className="caps-label mb-2">Forma de pago</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: Wallet, show: enabledPayments.includes('efectivo') },
                    { id: 'transferencia', label: 'Transferencia', icon: CreditCard, show: enabledPayments.includes('transferencia') },
                    { id: 'datafono', label: 'Datáfono', icon: Smartphone, show: enabledPayments.includes('datafono') },
                  ].filter(m => m.show).map(m => {
                    const isSelectedPay = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 text-sm transition-all active:scale-95 cursor-pointer ${
                          isSelectedPay
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 font-medium hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelectedPay && (
                          <span className="absolute right-2 top-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        )}
                        <m.icon size={19} strokeWidth={isSelectedPay ? 2.2 : 1.75} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Cash change details */}
                {paymentMethod === 'efectivo' && (
                  <div
                    className="rounded-xl p-3 space-y-2 animate-fade-in"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  >
                    <label htmlFor="cash-paid-with" className="block text-xs font-semibold text-slate-700">
                      ¿Con cuánto pagas? <span className="font-normal text-slate-500">(opcional, para llevar cambio)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Exacto', '$20.000', '$50.000', '$100.000'].map(preset => {
                        const isActive = cashPaidWith === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCashPaidWith(isActive ? '' : preset)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              isActive
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {preset}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      id="cash-paid-with"
                      type="text"
                      value={cashPaidWith}
                      onChange={e => {
                        const raw = e.target.value;
                        if (/[a-zA-Z]/.test(raw)) {
                          setCashPaidWith(raw);
                        } else {
                          const formatted = formatThousandsInput(raw);
                          setCashPaidWith(formatted ? `$${formatted}` : '');
                        }
                      }}
                      placeholder="O escribe otro monto (ej: $30.000)"
                      className="input-field py-2 text-xs tabular-nums"
                    />
                  </div>
                )}

                {/* Transfer details */}
                {paymentMethod === 'transferencia' && (
                  <div
                    className="rounded-lg p-4 space-y-3 animate-fade-in"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-3)' }}>
                          {business?.pago_banco || 'Nequi / Llave'} — Datos para transferir:
                        </p>
                        <p className="text-base font-semibold tabular-nums truncate" style={{ color: 'var(--color-text-1)' }}>
                          {business?.pago_alias || 'Consultar en chat'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className={`btn-primary py-1.5 px-3 text-xs shrink-0 ${hasCopiedAccount ? '!bg-green-600' : ''}`}
                      >
                        {hasCopiedAccount ? <Check size={13} /> : <Copy size={13} />}
                        {hasCopiedAccount ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>

                    {deliveryMethod === 'envio' && tipoDom === 'manual' ? (
                      <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                        Envía tu pedido primero para que el comercio cotice tu domicilio. Cuando te confirmen el total final, podrás transferir el valor completo y enviar tu comprobante.
                      </div>
                    ) : (
                      <ol className="space-y-1.5">
                        {[
                          'Copia el número o llave con el botón de arriba.',
                          'Realiza la transferencia desde tu banco o billetera.',
                          'Adjunta el comprobante al confirmar tu pedido por WhatsApp.',
                        ].map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-2)' }}>
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-semibold shrink-0 mt-0.5"
                              style={{ backgroundColor: 'var(--color-brand)', fontSize: '10px' }}
                            >
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </div>

              {/* ── COMMENT ── */}
              <div>
                <label htmlFor="order-comments" className="caps-label mb-2 block">Comentarios (opcional)</label>
                <textarea
                  id="order-comments"
                  value={cart.comment}
                  onChange={e => setComment(bid, e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Ej: Instrucciones de entrega, timbre, referencias..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer sticky */}
        {!orderResult && (
          <div
            className="px-4 py-3 sm:px-5 sm:py-4 border-t shrink-0 pb-safe"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {/* Total */}
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-2)' }}>
                Total{tableNumber
                  ? ` (Mesa ${tableNumber})`
                  : deliveryMethod === 'envio'
                    ? (tipoDom === 'manual'
                        ? ' (+ envío por cotizar)'
                        : tipoDom === 'automatico' && !locationLink
                          ? ' (sin envío aún)'
                          : ' (con envío)')
                    : ' (recoge en tienda)'}
              </span>
              <span className="text-lg sm:text-xl font-bold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                {tipoDom === 'manual' && deliveryMethod === 'envio'
                  ? formatMoney(subtotal)
                  : formatMoney(total)
                }
              </span>
            </div>

            {scheduleStatus?.isOpen === false && (
              <div className="mb-2.5 sm:mb-3 p-2.5 sm:p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Comercio cerrado en este momento</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    {scheduleStatus?.message || 'El negocio no está recibiendo pedidos por ahora.'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedItems.length === 0 || scheduleStatus?.isOpen === false}
              className={`w-full min-h-12 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                scheduleStatus?.isOpen === false ? '!bg-gray-400 !border-gray-400 !cursor-not-allowed opacity-75' : ''
              }`}
            >
              {isSubmitting ? (
                <LoadingSpinner size={18} />
              ) : scheduleStatus?.isOpen === false ? (
                <span>Tienda cerrada · Pedidos pausados</span>
              ) : (
                <>
                  <WhatsAppIcon size={19} />
                  <span>
                    {tableNumber
                      ? `Confirmar orden para Mesa #${tableNumber}`
                      : 'Confirmar por WhatsApp'
                    }
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-3)' }}>
              {scheduleStatus?.isOpen === false 
                ? 'Podrás enviar tu pedido cuando el comercio abra nuevamente' 
                : tableNumber
                  ? 'Se notificará al restaurante con tu orden y mesa'
                  : 'Se abrirá WhatsApp con tu pedido listo'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
