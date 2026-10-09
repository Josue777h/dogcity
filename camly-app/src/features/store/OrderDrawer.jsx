import { useState, useEffect, lazy, Suspense } from 'react';
import {
  User, Phone, MapPin, Loader2, Navigation, MessageCircle,
  Copy, Check, Trash2, X, Wallet, ShoppingBag, Truck,
  CheckCircle2, ShoppingCart, Minus, Plus, CreditCard, AlertCircle
} from 'lucide-react';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';
import { formatMoney, openWhatsApp, reverseGeocode, formatWhatsAppMessage } from '../../lib/utils';
import { saveOrder } from '../../lib/supabase';
import { WHATSAPP_FALLBACK_PHONE } from '../../lib/constants';

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

export default function OrderDrawer({ isOpen, onClose, scheduleStatus }) {
  const business  = useBusinessStore(s => s.business);
  const products  = useBusinessStore(s => s.products);
  const bid       = business?.id;
  const addToast  = useToastStore(s => s.addToast);

  const {
    carts, customerName, customerPhone, customerAddress,
    locationLink, setCustomer, setLocation, setComment,
    getSelectedItems, clearCart, increment, decrement
  } = useCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [paymentMethod,  setPaymentMethod]  = useState('');
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [orderResult,    setOrderResult]    = useState(null);
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [mapCoords,      setMapCoords]      = useState(null);
  const [deliveryFee,    setDeliveryFee]    = useState(0);
  const [distanceKm,     setDistanceKm]     = useState(null);

  const tipoDom        = business?.tipo_domicilio || 'automatico';
  const cart           = carts[bid] || { quantities: {}, notes: {}, comment: '' };
  const selectedItems  = getSelectedItems(bid, products);
  const subtotal       = selectedItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const total          = deliveryMethod === 'envio' ? subtotal + deliveryFee : subtotal;
  const whatsappPhone  = (business?.whatsapp_contacto || business?.telefono || WHATSAPP_FALLBACK_PHONE).replace(/\D/g, '');

  const handleClose = () => {
    setOrderResult(null);
    setLocation('', '');
    setDeliveryMethod('');
    setPaymentMethod('');
    setMapCoords(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setOrderResult(null);
      setLocation('', '');
      setDeliveryMethod('');
      setPaymentMethod('');
      setMapCoords(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setDeliveryMethod('');
      setPaymentMethod('');
      setDeliveryFee(0);
      setDistanceKm(null);
      setMapCoords(null);
      setLocation('', '');
    }
  }, [isOpen]);

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
    const itemsLines = selectedItems.flatMap(i => {
      const note = (i.note || cart.notes?.[i.id] || '').trim();
      const opts = (i.opciones_texto || '').trim();
      const extra = [opts, note].filter(Boolean).join(' · ');
      return [`${i.quantity} x ${i.name}`, ...(extra ? [`  Opciones: ${extra}`] : []), `  ${formatMoney(i.price * i.quantity)}`];
    });

    const trackingUrl  = `${window.location.origin}/tracking/${orderId}?token=${encodeURIComponent(token)}`;
    const addressLine  = customerAddress?.trim() || (locationLink ? 'Ver ubicación GPS en el mapa' : 'No especificada');
    const quotePending = tipoDom === 'manual' && deliveryMethod === 'envio';
    return formatWhatsAppMessage(`PEDIDO #${orderId} | ${bizName}`, [
      { title: 'Productos', lines: itemsLines },
      { title: 'Entrega', lines: [
        deliveryMethod === 'envio' ? `Dirección: ${addressLine}` : 'Modalidad: Recoger en tienda',
        deliveryMethod === 'envio' && locationLink ? `Mapa: ${locationLink}` : '',
        deliveryMethod === 'envio' ? `Domicilio: ${quotePending ? 'Pendiente de cotización' : formatMoney(deliveryFee)}` : '',
      ] },
      { title: 'Resumen y pago', lines: [
        `Subtotal: ${formatMoney(subtotal)}`,
        deliveryMethod === 'envio' && !quotePending ? `Domicilio: ${formatMoney(deliveryFee)}` : '',
        quotePending ? 'Total: Pendiente de cotización del envío' : `Total: ${formatMoney(total)}`,
        `Pago: ${paymentMethod === 'transferencia' ? `Transferencia (${business?.pago_banco || 'Nequi'})` : 'Efectivo'}`,
      ] },
      { title: 'Cliente', lines: [`Nombre: ${customerName}`, `Contacto: ${customerPhone}`, cart.comment ? `Nota: ${cart.comment}` : ''] },
      { title: 'Seguimiento', lines: [trackingUrl] },
    ]);
  }

  function updateLocationFromCoords(lat, lng, label = 'Ubicación ajustada') {
    setLocation(`https://maps.google.com/?q=${lat},${lng}`, label);
    setMapCoords({ lat, lng });
    if (!customerAddress?.trim()) {
      reverseGeocode(lat, lng).then(addr => { if (addr) setCustomer('customerAddress', addr); });
    }
    const bizLat = parseFloat(business?.lat);
    const bizLng = parseFloat(business?.lng);
    if (tipoDom === 'fijo') {
      setDeliveryFee(Number(business?.precio_domicilio) || 0);
    } else if (tipoDom === 'manual') {
      setDeliveryFee(0);
    } else {
      let dist = 1.0;
      if (bizLat && bizLng && !isNaN(bizLat) && !isNaN(bizLng)) {
        dist = calculateDistance(bizLat, bizLng, lat, lng);
      }
      setDistanceKm(dist);
      const costPerKm   = Number(business?.costo_por_km) || 1200;
      const minFee      = Number(business?.domicilio_minimo) || 3000;
      const calculatedFee = Math.max(minFee, Math.round((dist * costPerKm) / 100) * 100);
      setDeliveryFee(calculatedFee);
    }
  }

  function requestGps() {
    if (!navigator.geolocation) {
      addToast('GPS no disponible en este dispositivo o navegador', 'error');
      return;
    }
    setIsCalculating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        updateLocationFromCoords(pos.coords.latitude, pos.coords.longitude, 'GPS capturado');
        addToast('Ubicación GPS capturada con éxito', 'success');
        setIsCalculating(false);
      },
      err => {
        let msg = 'No se pudo acceder al GPS. Asegúrate de permitir el acceso a tu ubicación.';
        if (err.code === 1) msg = 'Permiso de ubicación denegado. Actívalo en tu navegador para continuar.';
        addToast(msg, 'warning');
        setIsCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
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
    if (selectedItems.length === 0)  { addToast('Agrega al menos un producto', 'warning'); return; }
    if (!deliveryMethod)             { addToast('Elige cómo recibir tu pedido (A domicilio o Recoger en local)', 'warning'); return; }
    if (!customerName.trim())        { addToast('¿Cuál es tu nombre?', 'warning'); return; }
    if (!customerPhone.trim())       { addToast('¿Cuál es tu teléfono?', 'warning'); return; }
    if (deliveryMethod === 'envio' && !locationLink) {
      addToast('Debes leer tu ubicación por GPS antes de hacer el pedido', 'warning');
      requestGps();
      return;
    }
    if (!paymentMethod)              { addToast('Selecciona la forma de pago (Efectivo o Transferencia)', 'warning'); return; }

    setIsSubmitting(true);
    try {
      const token   = crypto.randomUUID();
      const isCustomQuote = deliveryMethod === 'envio' && tipoDom === 'manual';
      const initialStatus = isCustomQuote ? 'COTIZACION_PENDIENTE' : 'nuevo';
      const deliveryType = deliveryMethod === 'recogida'
        ? 'pickup'
        : isCustomQuote
          ? 'custom_quote'
          : tipoDom === 'fijo'
            ? 'fixed'
            : 'per_km';

      const payload = {
        nombre: customerName.trim(),
        telefono: customerPhone.trim(),
        direccion: deliveryMethod === 'envio' ? customerAddress : 'Retiro en local',
        ubicacion_link: locationLink,
        comentarios: (cart.comment || '').trim(),
        total,
        total_amount: total,
        subtotal_amount: subtotal,
        domicilio_costo: deliveryMethod === 'envio' ? deliveryFee : 0,
        delivery_fee: deliveryMethod === 'envio' ? deliveryFee : 0,
        distancia_km: distanceKm,
        status: initialStatus,
        estado: initialStatus,
        delivery_type: deliveryType,
        items: selectedItems.map(i => ({
          id: i.id, nombre: i.name, cantidad: i.quantity, precio: i.price,
          nota: (i.note || cart.notes?.[i.id] || '').trim(),
          opciones_texto: i.opciones_texto || '',
          opciones: i.options || []
        })),
        entrega_metodo: deliveryMethod,
        pago_metodo: paymentMethod,
        payment_method: paymentMethod === 'transferencia'
          ? (/daviplata/i.test(business?.pago_banco || '') ? 'transfer_daviplata'
            : /bancolombia/i.test(business?.pago_banco || '') ? 'transfer_bancolombia'
              : 'transfer_nequi')
          : 'cash',
        payment_status: 'pending',
        token,
        negocio_id: bid,
      };

      const orderId = await saveOrder(payload);
      if (!orderId) throw new Error('Error al guardar el pedido');

      const message = buildMessage(orderId, token);
      setOrderResult({ id: orderId, message, token });
      addToast(`Pedido #${orderId.toString().slice(-6).toUpperCase()} generado`, 'success');
      if (navigator.vibrate) navigator.vibrate(80);
      clearCart(bid);
      setLocation('', '');

      // Notificar al panel administrativo instantáneamente (incluso entre pestañas del navegador)
      if (typeof window !== 'undefined') {
        try {
          const bc = new BroadcastChannel('negu_orders_channel');
          bc.postMessage({ type: 'NEW_ORDER', orderId, negocioId: bid });
          bc.close();
        } catch {}
        try {
          localStorage.setItem('negu_latest_order_event', JSON.stringify({ bid, orderId, timestamp: Date.now() }));
        } catch {}
      }

      setTimeout(() => {
        openWhatsApp(whatsappPhone, message);
      }, 800);
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const enabledPayments = Array.isArray(business?.metodos_pago) ? business.metodos_pago : ['efectivo', 'transferencia'];

  return (
    <aside className={`fixed inset-0 z-[100] ${isOpen ? 'visible' : 'invisible'}`}>
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
                Finalizar pedido
              </h2>
              <p className="text-[11px] sm:text-xs" style={{ color: 'var(--color-text-2)' }}>
                Se enviará por WhatsApp
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-ghost p-1.5 sm:p-2" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-5 space-y-4 sm:space-y-5 hide-scrollbar">

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
                <p className="caps-label mb-2">Tu pedido</p>
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
                      <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                        {selectedItems.map((item, idx) => (
                          <div key={item.cartItemId || `${item.id}_${idx}`} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-1)' }}>
                                {item.name}
                              </p>
                              {item.opciones_texto && (
                                <p className="text-xs text-blue-600 font-medium truncate">
                                  {item.opciones_texto}
                                </p>
                              )}
                              {(item.note || cart.notes?.[item.id]) && (
                                <p className="text-xs mt-0.5 truncate text-gray-500 italic">
                                  Nota: {item.note || cart.notes?.[item.id]}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Stepper */}
                              <div
                                className="flex items-center rounded-lg border overflow-hidden bg-gray-50/50"
                                style={{ borderColor: 'var(--color-border)' }}
                              >
                                <button
                                  onClick={() => decrement(bid, item.cartItemId || item.id)}
                                  className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-100 cursor-pointer"
                                  style={{ color: 'var(--color-text-2)' }}
                                  aria-label="Restar una unidad"
                                >
                                  <Minus size={12} />
                                </button>
                                <span
                                  className="w-6 text-center text-xs font-bold tabular-nums"
                                  style={{ color: 'var(--color-text-1)' }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => increment(bid, item.cartItemId || item.id)}
                                  className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-100 cursor-pointer"
                                  style={{ color: 'var(--color-brand)' }}
                                  aria-label="Sumar una unidad"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-xs sm:text-sm font-bold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                                {formatMoney(item.quantity * item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Subtotal row */}
                      <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ backgroundColor: 'var(--color-bg)', borderTop: `1px solid var(--color-border)` }}
                      >
                        <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>Subtotal</span>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                          {formatMoney(subtotal)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── DELIVERY + DATA ── */}
              <div>
                <p className="caps-label mb-2">Datos de entrega</p>
                <div className="space-y-3">
                  {/* Method selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'envio', label: 'A domicilio', icon: Truck },
                      { id: 'recogida', label: 'Recoger en local', icon: ShoppingBag },
                    ].map(m => (
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
                        style={deliveryMethod === m.id ? {
                          borderColor: business?.theme_color || '#0284C7',
                          backgroundColor: `${business?.theme_color || '#0284C7'}10`,
                          color: business?.theme_color || '#0284C7'
                        } : {}}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                          deliveryMethod === m.id
                            ? 'shadow-2xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <m.icon size={18} strokeWidth={1.5} />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Name */}
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={customerName}
                      onChange={e => setCustomer('customerName', e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                    <input
                      type="tel"
                      placeholder="Tu teléfono / WhatsApp"
                      value={customerPhone}
                      onChange={e => setCustomer('customerPhone', e.target.value)}
                      className="input-field pl-9"
                    />
                  </div>

                  {/* Address + map (envio only) */}
                  {deliveryMethod === 'envio' && (
                    <div className="space-y-2">
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)' }} />
                        <input
                          type="text"
                          placeholder="Dirección, barrio o punto de referencia"
                          value={customerAddress}
                          onChange={e => setCustomer('customerAddress', e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>

                      {/* GPS Banner Status */}
                      {!locationLink ? (
                        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                              <MapPin size={16} className="animate-pulse" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-tight">GPS obligatorio para envío</p>
                              <p className="text-[11px] text-gray-600 truncate">Lee tu ubicación para habilitar el pedido</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={requestGps}
                            disabled={isCalculating}
                            className="btn-primary py-1.5 px-3 text-xs font-bold gap-1 rounded-lg shrink-0 shadow-xs"
                          >
                            {isCalculating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                            <span>{isCalculating ? 'Leyendo...' : 'Activar GPS'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span className="font-semibold text-emerald-800 truncate">Ubicación GPS confirmada</span>
                          </div>
                          <button
                            type="button"
                            onClick={requestGps}
                            disabled={isCalculating}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0"
                          >
                            Actualizar GPS
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
                            {isCalculating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                            Recalcular GPS
                          </button>
                        </div>
                      )}

                      {/* Map - rendered ONLY when customer GPS is captured */}
                      {mapCoords && locationLink && (
                        <Suspense
                          fallback={
                            <div
                              className="h-48 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                            >
                              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
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
                      )}

                      {/* Delivery fee */}
                      <div
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck size={14} style={{ color: 'var(--color-brand)' }} />
                          <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>Costo de envío</span>
                          {tipoDom === 'automatico' && distanceKm && (
                            <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                              · {distanceKm.toFixed(1)} km
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text-1)' }}>
                          {tipoDom === 'manual'
                            ? 'A confirmar'
                            : !locationLink
                              ? 'Pendiente de GPS'
                              : formatMoney(deliveryFee)
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: Wallet, show: enabledPayments.includes('efectivo') },
                    { id: 'transferencia', label: 'Transferencia', icon: CreditCard, show: enabledPayments.includes('transferencia') },
                  ].filter(m => m.show).map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={paymentMethod === m.id ? {
                        borderColor: business?.theme_color || '#0284C7',
                        backgroundColor: `${business?.theme_color || '#0284C7'}10`,
                        color: business?.theme_color || '#0284C7'
                      } : {}}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                        paymentMethod === m.id
                          ? 'shadow-2xs'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <m.icon size={18} strokeWidth={1.5} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Transfer details */}
                {paymentMethod === 'transferencia' && (
                  <div
                    className="rounded-lg p-4 space-y-3 animate-fade-in"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-3)' }}>
                          {business?.pago_banco || 'Nequi'} — Número para transferir:
                        </p>
                        <p className="text-base font-semibold tabular-nums truncate" style={{ color: 'var(--color-text-1)' }}>
                          {business?.pago_alias || 'Consultar en chat'}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyAccount}
                        className={`btn-primary py-1.5 px-3 text-xs shrink-0 ${hasCopiedAccount ? '!bg-green-600' : ''}`}
                      >
                        {hasCopiedAccount ? <Check size={13} /> : <Copy size={13} />}
                        {hasCopiedAccount ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <ol className="space-y-1.5">
                      {[
                        'Copia el número con el botón de arriba.',
                        `Transfiere ${formatMoney(total)} desde tu banco o app.`,
                        'Adjunta el comprobante al confirmar por WhatsApp.',
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
                  </div>
                )}
              </div>

              {/* ── COMMENT ── */}
              <div>
                <p className="caps-label mb-2">Comentarios (opcional)</p>
                <textarea
                  value={cart.comment}
                  onChange={e => setComment(bid, e.target.value)}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Ej: Cambio, instrucciones especiales..."
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
                Total{deliveryMethod === 'envio' && tipoDom !== 'manual' ? ' (con envío)' : ''}
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
              className={`btn-whatsapp w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold ${
                scheduleStatus?.isOpen === false ? '!bg-gray-400 !border-gray-400 !cursor-not-allowed opacity-75' : ''
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : scheduleStatus?.isOpen === false ? (
                <span>Tienda cerrada · Pedidos pausados</span>
              ) : (
                <>
                  <WhatsAppIcon size={18} />
                  <span>
                    {!deliveryMethod
                      ? 'Selecciona cómo recibir tu pedido'
                      : deliveryMethod === 'envio' && !locationLink
                        ? 'Activar GPS para enviar pedido'
                        : !paymentMethod
                          ? 'Selecciona la forma de pago'
                          : 'Enviar pedido por WhatsApp'
                    }
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-3)' }}>
              {scheduleStatus?.isOpen === false 
                ? 'Podrás enviar tu pedido cuando el comercio abra nuevamente' 
                : 'Se abrirá WhatsApp con tu pedido listo'}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
