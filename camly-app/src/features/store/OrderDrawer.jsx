import { useState } from 'react';
import { User, Phone, MapPin, Loader2, Navigation, MessageCircle, Copy, Trash2, X, CreditCard, Wallet, ShoppingBag, Truck, CheckCircle2, Smartphone, ShoppingCart } from 'lucide-react';
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

export default function OrderDrawer({ isOpen, onClose }) {
  const business = useBusinessStore((s) => s.business);
  const products = useBusinessStore((s) => s.products);
  const bid = business?.id;
  const addToast = useToastStore((s) => s.addToast);

  const { 
    carts, customerName, customerPhone, customerAddress,
    locationLink, setCustomer, setLocation, setComment,
    getSelectedItems, clearCart 
  } = useCartStore();

  const [deliveryMethod, setDeliveryMethod] = useState('envio');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  
  // Estados para domicilio inteligente
  const [isCalculating, setIsCalculating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  if (!bid) return null;

  const cart = carts[bid] || { quantities: {}, notes: {}, comment: '' };
  const selectedItems = getSelectedItems(bid, products);
  const subtotal = selectedItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const total = deliveryMethod === 'envio' ? subtotal + deliveryFee : subtotal;
  const whatsappPhone = (business?.telefono || WHATSAPP_FALLBACK_PHONE).replace(/\D/g, '');
  function buildMessage(orderId, token) {
    const lines = selectedItems.map((i) => {
      const note = (cart.notes[i.id] || '').trim();
      return note ? `• ${i.quantity} x ${i.name}\n  Nota: ${note}` : `• ${i.quantity} x ${i.name}`;
    }).join('\n');

    const subtotalText = formatMoney(subtotal);
    const deliveryText = deliveryMethod === 'envio' ? `Domicilio: ${formatMoney(deliveryFee)} ${distanceKm ? `(${distanceKm.toFixed(1)} km)` : ''}` : '';
    const totalText = `*Total: ${formatMoney(total)}*`;

    return [
      `¡Hola! Quiero hacer un pedido en *${business?.nombre_visible || 'la tienda'}*.`,
      '', 
      '🛒 *PRODUCTOS:*', 
      lines,
      '',
      '💰 *RESUMEN:*',
      `Subtotal: ${subtotalText}`,
      deliveryText,
      totalText,
      '',
      '📍 *ENTREGA:*',
      `Tipo: ${deliveryMethod === 'envio' ? 'Domicilio' : 'Recoger en local'}`,
      deliveryMethod === 'envio' ? `Dirección (referencia): ${customerAddress || 'No proporcionada'}` : '',
      deliveryMethod === 'envio' ? `Ubicación exacta: ${locationLink}` : '',
      '',
      '👤 *DATOS DEL CLIENTE:*',
      `Nombre: ${customerName}`,
      `Teléfono: ${customerPhone}`,
      '',
      '💳 *MÉTODO DE PAGO:*',
      paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia',
      '',
      paymentMethod === 'transferencia' ? 'Enviaré el comprobante por este medio.\n' : '',
      `📦 Pedido #${orderId.toString().slice(-6).toUpperCase()}`,
      `🔗 Seguimiento:`,
      `${window.location.origin}/tracking?id=${orderId}&token=${token}`,
    ].filter(Boolean).join('\n');
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
        
        // Lógica de cobro: costo_por_km (def: 1000) o minimo (def: 3000)
        const costPerKm = business.costo_por_km || 1000;
        const minFee = business.domicilio_minimo || 3000;
        
        const calculatedFee = Math.max(minFee, Math.round(dist * costPerKm / 100) * 100);
        setDeliveryFee(calculatedFee);
        addToast(`Envío calculado: ${formatMoney(calculatedFee)} (${dist.toFixed(1)} km)`, 'success');
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
      addToast(`Pedido # ${orderId.toString().slice(-6)} generado`, 'success');
      if (business?.theme_color) {
        document.documentElement.style.setProperty('--primary-brand', business.theme_color);
      }
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) { addToast('GPS no soportado en este navegador', 'error'); return; }
    
    // Feedback visual inmediato de carga
    setIsCalculating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation(`https://maps.google.com/?q=${lat},${lng}`, 'Ubicación GPS capturada');
        
        // Calcular costo si el negocio tiene coordenadas
        if (business?.lat && business?.lng) {
          const dist = calculateDistance(
            parseFloat(business.lat), 
            parseFloat(business.lng), 
            lat, 
            lng
          );
          setDistanceKm(dist);
          const costPerKm = business.costo_por_km || 1000;
          const minFee = business.domicilio_minimo || 3000;
          const calculatedFee = Math.max(minFee, Math.round(dist * costPerKm / 100) * 100);
          setDeliveryFee(calculatedFee);
        }
        
        addToast('Ubicación fijada con éxito ✅', 'success');
        setIsCalculating(false);
      },
      (err) => {
        console.error(err);
        addToast('Error al obtener ubicación. Activa el GPS.', 'error');
        setIsCalculating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                 <ShoppingBag size={20} />
               </div>
               <div>
                 <h2 className="text-lg font-black text-dark uppercase tracking-tight">Finalizar Pedido</h2>
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mt-0.5">Sigue los pasos para ordenar</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-bg-alt rounded-full transition-colors text-muted hover:text-dark">
               <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
            {/* Items Summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Resumen de Compra
              </h3>
              <div className="bg-bg-alt rounded-[2rem] border border-border overflow-hidden">
                {selectedItems.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm font-medium">El carrito está vacío</div>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="p-6 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dark">{item.quantity}x {item.name}</span>
                          {cart.notes[item.id] && <span className="text-[10px] text-muted italic mt-0.5 bg-white px-2 py-0.5 rounded-full border border-border w-fit">{cart.notes[item.id]}</span>}
                        </div>
                        <span className="text-sm font-black text-dark">{formatMoney(item.quantity * item.price)}</span>
                      </div>
                    ))}
                    <div className="p-8 bg-brand text-white flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total a pagar</span>
                        <span className="text-2xl font-black italic tracking-tighter">{formatMoney(total)}</span>
                      </div>
                      <ShoppingCart size={24} className="opacity-40" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Form */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Tus Datos
              </h3>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setDeliveryMethod('envio')} 
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${deliveryMethod === 'envio' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                  >
                    <Truck size={24} className={deliveryMethod === 'envio' ? 'text-brand' : 'text-muted'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">A Domicilio</span>
                  </button>
                  <button 
                    onClick={() => { setDeliveryMethod('recogida'); setLocation(null, ''); setDeliveryFee(0); setDistanceKm(null); }} 
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${deliveryMethod === 'recogida' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                  >
                    <ShoppingBag size={24} className={deliveryMethod === 'recogida' ? 'text-brand' : 'text-muted'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recoger</span>
                  </button>
                </div>

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                  <input 
                    type="text" placeholder="Tu Nombre" 
                    value={customerName} onChange={(e) => setCustomer('customerName', e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-sm font-bold shadow-sm"
                  />
                </div>
                
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                  <input 
                    type="tel" placeholder="WhatsApp" 
                    value={customerPhone} onChange={(e) => setCustomer('customerPhone', e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-sm font-bold shadow-sm"
                  />
                </div>

                {deliveryMethod === 'envio' && (
                  <div className="relative group animate-in slide-in-from-top-2 duration-300">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-brand transition-colors" size={18} />
                    <input 
                      type="text" placeholder="Dirección / Punto de referencia" 
                      value={customerAddress} onChange={(e) => setCustomer('customerAddress', e.target.value)} 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all outline-none text-sm font-bold shadow-sm"
                    />
                  </div>
                )}

                {deliveryMethod === 'envio' && !locationLink && (
                  <button 
                    onClick={requestLocation} 
                    disabled={isCalculating}
                    className="w-full py-5 bg-success text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xl shadow-success/20 active:scale-95 transition-all animate-pulse"
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
                  <div className="bg-success/5 border border-success/20 p-4 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center text-success">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-success uppercase tracking-widest">Ubicación Precisa</p>
                        <p className="text-[9px] font-bold text-muted uppercase mt-0.5">Capturada mediante GPS</p>
                      </div>
                    </div>
                    <button onClick={requestLocation} className="text-[9px] font-black text-success underline uppercase tracking-widest">Cambiar</button>
                  </div>
                )}

                {deliveryFee > 0 && deliveryMethod === 'envio' && (
                  <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                       <Truck size={14} /> Domicilio ({distanceKm?.toFixed(1)} km)
                    </span>
                    <span className="text-sm font-black text-brand">{formatMoney(deliveryFee)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Methods */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand rounded-full" /> Forma de Pago
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('efectivo')} 
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'efectivo' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                >
                  <Wallet size={24} className={paymentMethod === 'efectivo' ? 'text-brand' : 'text-muted'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Efectivo</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('transferencia')} 
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === 'transferencia' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-border opacity-50'}`}
                >
                  <CreditCard size={24} className={paymentMethod === 'transferencia' ? 'text-brand' : 'text-muted'} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Transferencia</span>
                </button>
              </div>

              {paymentMethod === 'transferencia' && (
                <div className="p-6 bg-brand/5 border-2 border-dashed border-brand/20 rounded-2xl animate-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">Datos para el pago:</p>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-border shadow-sm">
                    <div>
                      <p className="text-[9px] font-black text-brand uppercase leading-none mb-1">{business?.pago_banco || 'Nequi'}</p>
                      <p className="text-lg font-black text-dark tracking-tight">{business?.pago_alias || 'Favor Consultar'}</p>
                    </div>
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(business?.pago_alias || ''); 
                        addToast('Número copiado ✅', 'success'); 
                      }}
                      className="p-3 bg-brand text-white rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
                      title="Copiar número"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  <p className="text-[9px] text-muted font-bold mt-4 italic">* Por favor envía el comprobante por WhatsApp al finalizar el pedido.</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-2">Comentarios Adicionales</label>
              <textarea 
                value={cart.comment} onChange={(e) => setComment(bid, e.target.value)} 
                className="w-full p-4 bg-white border border-border rounded-xl text-sm font-medium outline-none min-h-[100px] focus:border-brand" 
                placeholder="Ej: Tocar el timbre fuerte, traer cambio de 50mil..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-bg-alt sticky bottom-0 z-10">
            {!orderResult ? (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedItems.length === 0} 
                className="w-full group btn-primary !py-5 shadow-2xl shadow-brand/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={20} />
                      <span className="text-lg">REALIZAR PEDIDO</span>
                    </div>
                    <span className="text-[9px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1 italic">Vía WhatsApp Automatizado</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <a 
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(orderResult.message)}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full btn-primary !bg-success !border-success py-4 shadow-xl shadow-success/20 animate-bounce"
                >
                  <MessageCircle size={20} /> <span className="text-lg uppercase">ABRIR WHATSAPP</span>
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(orderResult.message); addToast('Copiado', 'success'); }} className="py-3 bg-dark text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2">
                    <Copy size={14}/> Copiar
                  </button>
                  <button onClick={() => { clearCart(bid); setOrderResult(null); onClose(); }} className="py-3 border-2 border-brand text-brand rounded-xl text-xs font-black uppercase transition-colors hover:bg-brand hover:text-white">
                    Nuevo Pedido
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
