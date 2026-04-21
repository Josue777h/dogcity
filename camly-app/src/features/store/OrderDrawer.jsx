import { useState } from 'react';
import { User, Phone, MapPin, Loader2, Navigation, MessageCircle, Copy, Trash2, X, CreditCard, Wallet, ShoppingBag } from 'lucide-react';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';
import { formatMoney, openWhatsApp } from '../../lib/utils';
import { saveOrder } from '../../lib/supabase';
import { WHATSAPP_FALLBACK_PHONE } from '../../lib/constants';

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

  if (!bid) return null;

  const cart = carts[bid] || { quantities: {}, notes: {}, comment: '' };
  const selectedItems = getSelectedItems(bid, products);
  const total = selectedItems.reduce((s, i) => s + i.quantity * i.price, 0);
  const whatsappPhone = (business?.telefono || WHATSAPP_FALLBACK_PHONE).replace(/\D/g, '');
  function buildMessage(orderId, token) {
    const lines = selectedItems.map((i) => {
      const note = (cart.notes[i.id] || '').trim();
      return note ? `• ${i.quantity} x ${i.name}\n  Nota: ${note}` : `• ${i.quantity} x ${i.name}`;
    }).join('\n');

    return [
      `¡Hola! Quiero hacer un pedido en *${business?.nombre_visible || 'la tienda'}*.`,
      '', 
      '🛒 *PRODUCTOS:*', 
      lines,
      '', 
      `💰 *TOTAL: ${formatMoney(total)}*`,
      '', 
      '👤 *DATOS DE ENTREGA:*', 
      `Nombre: ${customerName}`,
      `Teléfono: ${customerPhone}`,
      `Dirección: ${customerAddress || 'Recogida en local'}`,
      '', 
      `📍 *ENTREGA:* ${deliveryMethod === 'envio' ? 'Domicilio 🛵' : 'Recoger en local 🏠'}`,
      `💳 *MÉTODO DE PAGO:* ${paymentMethod === 'efectivo' ? 'Efectivo 💵' : 'Transferencia 📱'}`,
      paymentMethod === 'transferencia' ? '\n⚠️ _Enviaré el comprobante de transferencia por este medio._' : '',
      locationLink ? `\n📍 *VALOR DE UBICACIÓN GPS:* ${locationLink}` : '',
      cart.comment ? `\n💬 *COMENTARIO:* ${cart.comment}` : '',
      '', 
      `🧾 *PEDIDO #${orderId.toString().slice(-6).toUpperCase()}*`,
      `🔗 *SEGUIMIENTO EN VIVO:* ${window.location.origin}/tracking?id=${orderId}&token=${token}`,
    ].filter(Boolean).join('\n');
  }

  async function handleSubmit() {
    if (selectedItems.length === 0) { addToast('Selecciona al menos un producto', 'warning'); return; }
    if (!customerName.trim()) { addToast('Ingresa tu nombre', 'warning'); return; }
    if (!customerPhone.trim()) { addToast('Ingresa tu teléfono', 'warning'); return; }

    setIsSubmitting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15);
      const payload = {
        nombre: customerName.trim(),
        telefono: customerPhone.trim(),
        direccion: customerAddress.trim(),
        ubicacion_link: locationLink,
        comentarios: (cart.comment || '').trim(),
        total,
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
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) { addToast('Navegador insuficiente', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`, 'Ubicación agregada');
        addToast('Ubicación capturada con éxito', 'success');
      },
      () => addToast('Permiso denegado por el usuario', 'error')
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
                 <h2 className="text-lg font-black text-dark uppercase tracking-tight">Tu Pedido</h2>
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mt-0.5">Checkout Seguro</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-bg-alt rounded-full transition-colors text-muted hover:text-dark">
               <X size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
            {/* Items Summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.15em]">🏷️ Resumen de Compra</h3>
              <div className="bg-bg-alt rounded-2xl border border-border overflow-hidden">
                {selectedItems.length === 0 ? (
                  <div className="p-8 text-center text-muted text-sm font-medium">El carrito está vacío</div>
                ) : (
                  <div className="divide-y divide-border">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-dark">{item.quantity}x {item.name}</span>
                          {cart.notes[item.id] && <span className="text-[10px] text-muted italic mt-0.5">{cart.notes[item.id]}</span>}
                        </div>
                        <span className="text-sm font-black text-dark">{formatMoney(item.quantity * item.price)}</span>
                      </div>
                    ))}
                    <div className="p-4 bg-brand/5 flex items-center justify-between">
                      <span className="text-sm font-black text-brand uppercase tracking-widest">Total a pagar</span>
                      <span className="text-xl font-black text-brand">{formatMoney(total)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Form */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-muted uppercase tracking-[0.15em]">👤 Datos de Entrega</h3>
              <div className="grid gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="text" placeholder="Nombre completo" 
                    value={customerName} onChange={(e) => setCustomer('customerName', e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm font-bold"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="tel" placeholder="WhatsApp / Teléfono" 
                    value={customerPhone} onChange={(e) => setCustomer('customerPhone', e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm font-bold"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input 
                    type="text" placeholder="Dirección exacta" 
                    value={customerAddress} onChange={(e) => setCustomer('customerAddress', e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none text-sm font-bold"
                  />
                </div>
                <button onClick={requestLocation} className="w-full py-3 bg-success/10 text-success border border-success/20 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-colors hover:bg-success/20">
                  <Navigation size={14}/> {locationLink ? 'UBICACIÓN CAPTURADA ✓' : 'COMPARTIR MI UBICACIÓN GPS'}
                </button>
              </div>
            </div>

            {/* Methods */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-2">Método Entrega</label>
                <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} className="w-full p-4 bg-white border border-border rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-brand">
                  <option value="envio">🛵 Domicilio</option>
                  <option value="recogida">🏠 Recoger en local</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-2">Método Pago</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-4 bg-white border border-border rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-brand">
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">📱 Transferencia</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'transferencia' && (
              <div className="p-6 bg-brand/5 border border-dashed border-brand/30 rounded-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-brand/10 rounded-lg text-brand">
                    <Wallet size={20} />
                  </div>
                  <h4 className="text-xs font-black text-dark uppercase tracking-tight">Datos de Transferencia</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-bold uppercase tracking-widest">Banco</span>
                    <span className="text-dark font-black">{business?.pago_banco || 'Por confirmar'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted font-bold uppercase tracking-widest">Cuenta / Alias</span>
                    <span className="group flex items-center gap-2">
                      <span className="text-dark font-black">{business?.pago_alias || 'Por confirmar'}</span>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(business?.pago_alias); addToast('Copiado', 'info'); }}
                        className="text-brand hover:scale-110 transition-transform"
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </div>
                  <p className="text-[10px] text-brand/60 font-medium italic mt-2">
                    * Favor enviar el comprobante por WhatsApp después de generar el pedido.
                  </p>
                </div>
              </div>
            )}

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
