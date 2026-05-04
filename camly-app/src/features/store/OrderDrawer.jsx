import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Loader2, Navigation, MessageCircle, Copy, Trash2, X, CreditCard, Wallet, ShoppingBag, Truck, CheckCircle2, Smartphone, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';
import { formatMoney, openWhatsApp } from '../../lib/utils';
import { saveOrder } from '../../lib/supabase';
import { WHATSAPP_FALLBACK_PHONE } from '../../lib/constants';

// Función para calcular distancia entre dos puntos (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

import LocationPickerMap from './components/LocationPickerMap';

export default function OrderDrawer({ isOpen, onClose }) {
  const business = useBusinessStore((s) => s.business);
  const products = useBusinessStore((s) => s.products);
  const bid = business?.id;
  const addToast = useToastStore((s) => s.addToast);

  const { 
    carts, customerName, customerPhone, customerAddress,
    locationLink, setCustomer, setLocation, setComment,
    getSelectedItems, clearCart, increment, decrement 
  } = useCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState('envio');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  
  // Estados para domicilio inteligente
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  
  // Reiniciar ubicación cada vez que se abre el pedido (Requisito: GPS Fresco)
  useEffect(() => {
    if (isOpen) {
      setCustomer('customerAddress', '');
      setLocation(null, '');
      setDistanceKm(null);
      setDeliveryFee(0);
    }
  }, [isOpen]);

  if (!bid) return null;

  const cart = carts[bid] || { quantities: {}, notes: {}, comment: '' };
  const selectedItems = getSelectedItems(bid, products);
  const subtotal = selectedItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const total = deliveryMethod === 'envio' ? subtotal + deliveryFee : subtotal;
  const whatsappPhone = (business?.whatsapp_contacto || business?.telefono || WHATSAPP_FALLBACK_PHONE).replace(/\D/g, '');
  const tipoDom = business?.tipo_domicilio || 'automatico';

  function buildMessage(orderId, token) {
    const rawName = business?.nombre_visible || 'la tienda';
    const formattedBusinessName = rawName.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const itemsLines = selectedItems.map((i) => {
      const note = (cart.notes[i.id] || '').trim();
      return `• ${i.quantity} x ${i.name}${note ? ` (${note})` : ''}`;
    }).join('\n');

    const trackingUrl = `${window.location.origin}/tracking?id=${orderId}&token=${token}`;
    
    let envioString = '';
    if (deliveryMethod === 'envio') {
      if (tipoDom === 'manual') envioString = 'Domicilio: Por confirmar';
      else if (tipoDom === 'fijo') envioString = `Domicilio: ${formatMoney(deliveryFee)}`;
      else envioString = `Domicilio: ${formatMoney(deliveryFee)}${distanceKm ? ` (${distanceKm.toFixed(1)} km)` : ''}`;
    }

    const parts = [
      `¡Nuevo pedido en *${formattedBusinessName}*!`,
      '',
      itemsLines,
      '',
      (tipoDom === 'manual' && deliveryMethod === 'envio') 
        ? `💰 Subtotal: ${formatMoney(total)}\n🔄 ${envioString}`
        : `💰 Total: ${formatMoney(total)}\n${deliveryMethod === 'envio' ? `🚚 ${envioString}` : ''}`,
      '',
      deliveryMethod === 'envio' 
        ? `📍 Dirección de entrega\n${customerAddress || 'Dirección no especificada'}\nVer en mapa → ${locationLink || ''}` 
        : '📍 Recoger en local',
      '',
      `👤 ${customerName} - ${customerPhone}`,
      '',
      `💳 Pago: ${paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}`,
      cart.comment ? `\n💬 Nota: ${cart.comment}` : '',
      '',
      `📦 Pedido #${orderId.toString().slice(-6).toUpperCase()}`,
      `🔎 Ver pedido → ${trackingUrl}`
    ].filter(Boolean);

    return parts.join('\n');
  }

  async function handleAddressUpdate(address) {
    setCustomer('customerAddress', address);
    if (!address || address.length < 5 || deliveryMethod !== 'envio') return;

    // Solo calcular si el negocio tiene Lat/Lng configurados
    if (!business?.lat || !business?.lng) return;

    setIsCalculating(true);
    try {
      // Usar Photon para obtener coordenadas de la dirección final
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const clientLat = feature.geometry.coordinates[1];
        const clientLng = feature.geometry.coordinates[0];
        
        const dist = calculateDistance(
          parseFloat(business.lat), 
          parseFloat(business.lng), 
          clientLat, 
          clientLng
        );
        
        setDistanceKm(dist);
        setDistanceKm(dist);
        
        if (tipoDom === 'fijo') {
          setDeliveryFee(Number(business.precio_domicilio) || 0);
          addToast(`Tarifa Fija de Envio Aplicada`, 'success');
        } else if (tipoDom === 'manual') {
          setDeliveryFee(0);
          addToast(`Ubicación capturada para confirmación`, 'success');
        } else {
          // Lógica de cobro Automático: costo_por_km (def: 1000) o minimo (def: 3000)
          const costPerKm = business.costo_por_km || 1000;
          const minFee = business.domicilio_minimo || 3000;
          const calculatedFee = Math.max(minFee, Math.round(dist * costPerKm / 100) * 100);
          setDeliveryFee(calculatedFee);
          addToast(`Envío calculado: ${formatMoney(calculatedFee)} (${dist.toFixed(1)} km)`, 'success');
        }
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleSubmit() {
    if (selectedItems.length === 0) { addToast('Selecciona al menos un producto', 'warning'); return; }
    if (!customerName.trim()) { addToast('Ingresa tu nombre', 'warning'); return; }
    if (!customerPhone.trim()) { addToast('Ingresa tu teléfono', 'warning'); return; }
    if (deliveryMethod === 'envio' && !locationLink) { addToast('Por favor captura tu ubicación GPS', 'warning'); return; }

    setIsSubmitting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15);
      const payload = {
        nombre: customerName.trim(),
        telefono: customerPhone.trim(),
        direccion: deliveryMethod === 'envio' ? customerAddress : 'Recogida en local',
        ubicacion_link: locationLink,
        comentarios: (cart.comment || '').trim(),
        total,
        domicilio_costo: deliveryMethod === 'envio' ? deliveryFee : 0,
        distancia_km: distanceKm,
        status: 'nuevo',
        items: selectedItems.map((i) => ({ 
          id: i.id, 
          nombre: i.name, 
          cantidad: i.quantity, 
          precio: i.price, 
          nota: cart.notes[i.id] || '' 
        })),
        entrega_metodo: deliveryMethod,
        pago_metodo: paymentMethod,
        token,
        negocio_id: bid,
      };

      const orderId = await saveOrder(payload);
      if (!orderId) throw new Error('Error al guardar el pedido');

      const message = buildMessage(orderId, token);
      setOrderResult({ id: orderId, message, token });
      
      addToast(`✅ Pedido #${orderId.toString().slice(-6).toUpperCase()} generado`, 'success');

      if (business?.theme_color) {
        document.documentElement.style.setProperty('--primary-brand', business.theme_color);
      }

      // Experiencia Pro: Vibración hápitca si está disponible
      if (navigator.vibrate) navigator.vibrate(100);

      // Limpiar carrito local inmediatamente después del éxito
      clearCart(bid);

      // Auto-redirección tras 1 segundo EXACTO
      setTimeout(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
        
        if (isMobile) {
          // En móvil, forzar redirección en la misma pestaña para evitar bloqueos de popup
          window.location.href = url;
        } else {
          // En desktop usamos la utilidad que maneja pestañas nuevas
          openWhatsApp(whatsappPhone, message);
        }
      }, 1000);

    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateLocationFromCoords(lat, lng, actionText = 'Ubicación Ajustada') {
    setLocation(`https://maps.google.com/?q=${lat},${lng}`, actionText);
    setMapCoords({ lat, lng });
    
    if (business?.lat && business?.lng) {
      const dist = calculateDistance(
        parseFloat(business.lat), 
        parseFloat(business.lng), 
        lat, 
        lng
      );
      setDistanceKm(dist);
      
      if (tipoDom === 'fijo') {
        setDeliveryFee(Number(business.precio_domicilio) || 0);
      } else if (tipoDom === 'manual') {
        setDeliveryFee(0);
      } else {
        const costPerKm = business.costo_por_km || 1000;
        const minFee = business.domicilio_minimo || 3000;
        const calculatedFee = Math.max(minFee, Math.round(dist * costPerKm / 100) * 100);
        setDeliveryFee(calculatedFee);
      }
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) { addToast('GPS no soportado en este navegador', 'error'); return; }
    
    setIsCalculating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLocationFromCoords(lat, lng, 'Ubicación GPS capturada');
        
        addToast('Ubicación fijada con éxito ✅', 'success');
        setIsCalculating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        let msg = 'Error al obtener ubicación.';
        if (err.code === 1) msg = 'Permiso denegado. Activa el GPS en ajustes.';
        if (err.code === 3) msg = 'Tiempo agotado. Intenta de nuevo.';
        
        addToast(msg, 'error');
        setIsCalculating(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  }

  return (
    <aside className={`fixed inset-0 z-[100] transition-visibility ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-dark/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-surface shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                 <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
               </div>
               <div>
                 <h2 className="text-sm sm:text-base font-black text-dark uppercase tracking-tight">Finalizar Pedido</h2>
                 <p className="text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-widest leading-none mt-0.5">Sigue los pasos para ordenar</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-bg-alt rounded-full transition-colors text-muted hover:text-dark">
               <X size={18} className="sm:w-5 sm:h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-5 hide-scrollbar">
            {orderResult ? (
              <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-success/10 rounded-full flex items-center justify-center text-success mb-4 sm:mb-6 relative">
                  <CheckCircle2 size={40} className="sm:w-12 sm:h-12 animate-in fade-in zoom-in duration-700" />
                  <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-dark uppercase tracking-tight mb-1 sm:mb-2">¡Pedido Generado!</h2>
                <p className="text-xs sm:text-sm font-bold text-muted uppercase tracking-widest mb-4 sm:mb-8">
                  Pedido #{orderResult.id.toString().slice(-6).toUpperCase()}
                </p>

                <div className="bg-bg-alt p-4 sm:p-6 rounded-2xl border border-border w-full space-y-3 sm:space-y-4 mb-4 sm:mb-8">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 text-brand">
                    <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Redirigiendo a WhatsApp...</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-tighter">
                    Si no se abre automáticamente en un momento, usa el botón de abajo.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3 w-full">
                  <button 
                    onClick={() => openWhatsApp(whatsappPhone, orderResult.message)}
                    className="w-full btn-primary !bg-success !border-success py-3 sm:!py-5 shadow-xl shadow-success/20 flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <MessageCircle size={20} className="sm:w-6 sm:h-6" /> <span className="text-base sm:text-lg">ABRIR WHATSAPP</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button 
                      onClick={() => { navigator.clipboard.writeText(orderResult.message); addToast('Mensaje copiado ✅', 'success'); }} 
                      className="py-3 sm:py-4 bg-dark text-white rounded-xl text-[10px] sm:text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-dark/90 transition-colors"
                    >
                      <Copy size={14} className="sm:w-4 sm:h-4" /> Copiar
                    </button>
                    <button 
                      onClick={() => { clearCart(bid); setOrderResult(null); onClose(); }} 
                      className="py-3 sm:py-4 border-2 border-brand text-brand rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all hover:bg-brand hover:text-white"
                    >
                      Nuevo Pedido
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Items Summary */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Resumen de Compra
                  </h3>
                  <div className="bg-bg-alt rounded-2xl border border-border overflow-hidden">
                    {selectedItems.length === 0 ? (
                      <div className="p-6 text-center text-muted text-xs font-medium">El carrito está vacío</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {selectedItems.map((item) => (
                          <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-xs font-bold text-dark truncate">{item.name}</span>
                              {cart.notes[item.id] && <span className="text-[9px] text-muted italic mt-0.5 bg-white px-2 py-0.5 rounded-full border border-border w-fit truncate max-w-full">{cart.notes[item.id]}</span>}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Mini Contador Compacto */}
                              <div className="flex items-center bg-white rounded-lg border border-border overflow-hidden p-0.5 shadow-sm">
                                <button 
                                  onClick={() => decrement(bid, item.id)}
                                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-brand hover:bg-brand/5 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-[11px] font-black text-dark">{item.quantity}</span>
                                <button 
                                  onClick={() => increment(bid, item.id)}
                                  className="w-6 h-6 flex items-center justify-center text-muted hover:text-brand hover:bg-brand/5 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              
                              <span className="text-xs font-black text-dark min-w-[60px] text-right">{formatMoney(item.quantity * item.price)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="p-4 bg-brand text-white flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Total a pagar</span>
                            <span className="text-xl font-black italic tracking-tighter">{formatMoney(total)}</span>
                          </div>
                          <ShoppingCart size={20} className="opacity-40" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Form */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Tus Datos
                  </h3>
                  
                <div className="grid gap-2 sm:gap-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button 
                      onClick={() => setDeliveryMethod('envio')} 
                      className={`p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${deliveryMethod === 'envio' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                    >
                      <Truck size={18} className={deliveryMethod === 'envio' ? 'text-brand' : 'text-muted'} />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">A Domicilio</span>
                    </button>
                    <button 
                      onClick={() => { setDeliveryMethod('recogida'); setLocation(null, ''); setDeliveryFee(0); setDistanceKm(null); setMapCoords(null); }} 
                      className={`p-2 sm:p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${deliveryMethod === 'recogida' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                    >
                      <ShoppingBag size={18} className={deliveryMethod === 'recogida' ? 'text-brand' : 'text-muted'} />
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Recoger</span>
                    </button>
                  </div>

                  <div className="relative group">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <input 
                      type="text" placeholder="Tu Nombre" 
                      value={customerName} onChange={(e) => setCustomer('customerName', e.target.value)} 
                      className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 bg-white border border-border rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-[11px] sm:text-xs font-bold shadow-sm"
                    />
                  </div>
                  
                  <div className="relative group">
                    <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <input 
                      type="tel" placeholder="WhatsApp" 
                      value={customerPhone} onChange={(e) => setCustomer('customerPhone', e.target.value)} 
                      className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 bg-white border border-border rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-[11px] sm:text-xs font-bold shadow-sm"
                    />
                  </div>

                  {deliveryMethod === 'envio' && (
                    <div className="relative group animate-in slide-in-from-top-2 duration-300">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <input 
                        type="text" placeholder="Dirección / Punto de referencia" 
                        value={customerAddress} onChange={(e) => setCustomer('customerAddress', e.target.value)} 
                        className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 bg-white border border-border rounded-xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-[11px] sm:text-xs font-bold shadow-sm"
                      />
                    </div>
                  )}

                    {mapCoords && deliveryMethod === 'envio' && (
                      <div className="animate-in fade-in zoom-in-95 duration-500">
                        <LocationPickerMap 
                          lat={mapCoords.lat} 
                          lng={mapCoords.lng} 
                          onLocationChange={(newLat, newLng) => updateLocationFromCoords(newLat, newLng, 'Pin Ajustado')} 
                        />
                      </div>
                    )}

                    {deliveryMethod === 'envio' && !locationLink && (
                      <button 
                        onClick={requestLocation} 
                        disabled={isCalculating}
                        className="w-full py-5 bg-success text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xl shadow-success/20 active:scale-95 transition-all animate-pulse mt-2"
                      >
                        {isCalculating ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <>
                            <div className="flex items-center gap-2 font-black text-sm">
                              <Navigation size={18} /> FIJAR MI UBICACIÓN GPS
                            </div>
                            <span className="text-[9px] font-bold uppercase opacity-80">Requerido para el domicilio</span>
                          </>
                        )}
                      </button>
                    )}

                    {locationLink && deliveryMethod === 'envio' && (
                      <div className="bg-success/5 border border-success/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-200 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center text-success">
                            <CheckCircle2 size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-success uppercase tracking-widest">Ubicación Precisa</p>
                            <p className="text-[9px] font-bold text-muted uppercase mt-0.5">Capturada y ajustada en GPS</p>
                          </div>
                        </div>
                        <button onClick={requestLocation} className="text-[9px] font-black text-success underline uppercase tracking-widest">Re-centrar</button>
                      </div>
                    )}

                    {deliveryFee >= 0 && deliveryMethod === 'envio' && (
                      <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-between">
                        <span className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                           <Truck size={14} /> Domicilio
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted tracking-widest uppercase mb-1">
                            {tipoDom === 'manual' ? 'Costo de envío' : (distanceKm && tipoDom === 'automatico') ? `${distanceKm.toFixed(1)} km` : 'Envío Local'}
                          </span>
                          <span className="text-sm font-black text-brand">
                            {tipoDom === 'manual' ? 'Por confirmar' : formatMoney(deliveryFee)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {tipoDom === 'manual' && deliveryMethod === 'envio' && (
                    <div className="bg-brand/5 border border-brand/20 p-3 rounded-xl mt-3 animate-in fade-in">
                       <p className="text-[9px] font-bold text-muted uppercase tracking-widest text-center">
                         * El valor del domicilio será confirmado por el negocio
                       </p>
                    </div>
                  )}
                </div>

                {/* Methods */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Forma de Pago
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setPaymentMethod('efectivo')} 
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === 'efectivo' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                    >
                      <Wallet size={20} className={paymentMethod === 'efectivo' ? 'text-brand' : 'text-muted'} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Efectivo</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('transferencia')} 
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === 'transferencia' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                    >
                      <CreditCard size={20} className={paymentMethod === 'transferencia' ? 'text-brand' : 'text-muted'} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Transferencia</span>
                    </button>
                  </div>

                  {paymentMethod === 'transferencia' && (
                    <div className="p-4 bg-brand/5 border-2 border-dashed border-brand/20 rounded-xl animate-in zoom-in-95 duration-200">
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-2">Datos para el pago:</p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-border shadow-sm">
                        <div>
                          <p className="text-[8px] font-black text-brand uppercase leading-none mb-1">{business?.pago_banco || 'Nequi'}</p>
                          <p className="text-base font-black text-dark tracking-tight">{business?.pago_alias || 'Favor Consultar'}</p>
                        </div>
                        <button 
                          onClick={() => { 
                            const alias = business?.pago_alias || '';
                            const banco = business?.pago_banco || '';
                            const aliasDigits = (alias.match(/\d/g) || []).length;
                            const bancoDigits = (banco.match(/\d/g) || []).length;
                            const toCopy = aliasDigits >= bancoDigits ? alias : banco;
                            navigator.clipboard.writeText(toCopy); 
                            addToast('Número copiado ✅', 'success'); 
                          }}
                          className="p-2.5 bg-brand text-white rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-muted uppercase tracking-widest pl-2">Comentarios Adicionales</label>
                  <textarea 
                    value={cart.comment} onChange={(e) => setComment(bid, e.target.value)} 
                    className="w-full p-3 bg-white border border-border rounded-xl text-xs font-medium outline-none min-h-[80px] focus:border-brand" 
                    placeholder="Ej: Traer cambio de 50mil..."
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-4 border-t border-border bg-bg-alt sticky bottom-0 z-10">
            {!orderResult ? (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedItems.length === 0} 
                className="w-full group btn-primary py-4 sm:!py-5 shadow-2xl shadow-brand/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                      <span className="text-base sm:text-lg">REALIZAR PEDIDO</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1 italic">Vía WhatsApp Automatizado</span>
                  </div>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
