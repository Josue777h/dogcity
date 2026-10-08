import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ChevronRight, User, MapPin, Package, Bike, Trash2, Map,
  MessageCircle, Loader2, AlertCircle, CheckCircle2, Check, X, Printer, Volume2, VolumeX, Bluetooth,
  Ban, FileText, ExternalLink, Clock
} from 'lucide-react';
import { 
  formatMoney, getOrderSubtotal, isDeliveryPending, 
  openWhatsApp, printThermalReceipt, playNewOrderSound
} from '../../../lib/utils';
import { isWebBluetoothSupported, printOrderViaBluetooth } from '../../../lib/bluetoothPrinter';
import { updateOrderStatus, getSupabase, deleteOrder } from '../../../lib/supabase';
import { OrderService } from '../../../services/orderService';
import { getStatusCopy } from '../../../lib/status-labels';
import { useBusinessStore, useToastStore } from '../../../stores';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const STATUS_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'nuevo', label: 'Nuevos' },
  { id: 'cotizacion', label: 'Por Cotizar' },
  { id: 'preparando', label: 'En Cocina' },
  { id: 'enviado', label: 'En Camino' },
  { id: 'entregado', label: 'Entregados' },
  { id: 'cancelado', label: 'Cancelados' },
];

const STATUS_STEPS = ['nuevo', 'preparando', 'enviado', 'entregado'];
const STATUS_LABELS = { nuevo: 'Nuevo', preparando: 'Preparando', enviado: 'Enviado', entregado: 'Entregado' };

function getStepIndex(rawStatus) {
  const s = (rawStatus || '').toString().toLowerCase();
  if (['nuevo', 'recibido', 'pendiente', 'cotizacion_pendiente', 'cotizacion_enviada', 'confirmado_gracia'].includes(s)) return 0;
  if (['preparando', 'en_preparacion'].includes(s)) return 1;
  if (['enviado', 'en_camino'].includes(s)) return 2;
  if (['entregado'].includes(s)) return 3;
  return 0;
}

const CANCEL_REASONS = [
  'Cliente no aceptó costo de envío',
  'Dirección fuera de cobertura',
  'Cliente no responde',
  'Comprobante de pago inválido',
  'Otro (especificar)'
];

function MerchantCancelModal({ isOpen, order, onClose, onConfirmed }) {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Otro (especificar)' ? customReason.trim() : selectedReason;
    if (!finalReason) {
      addToast('Por favor especifica el motivo de la cancelación', 'warning');
      return;
    }
    setLoading(true);
    try {
      await OrderService.merchantCancelOrder(order.id, finalReason);
      addToast('Pedido cancelado correctamente', 'info');
      onConfirmed();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error al cancelar el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 animate-fade-in-up">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
              <Ban size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-950">
                Cancelar Pedido #{order.id.toString().slice(-4).toUpperCase()}
              </h2>
              <p className="text-[11px] text-gray-500">Selecciona el motivo de cancelación obligatorio</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800">
              Motivo de la cancelación:
            </label>
            <div className="space-y-1.5">
              {CANCEL_REASONS.map((reason) => (
                <label 
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-rose-500 bg-rose-50/60 text-rose-950 ring-1 ring-rose-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancellationReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-rose-600 w-4 h-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Otro (especificar)' && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-[11px] font-bold text-gray-700">
                Detalla el motivo:
              </label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Escribe el motivo aquí..."
                className="input-field text-xs w-full bg-gray-50 focus:bg-white resize-none"
                required
              />
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              <span>Confirmar Cancelación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderTimeline({ currentStatus, onStatusChange }) {
  const currentIdx = getStepIndex(currentStatus);
  return (
    <div className="py-2.5 px-4 bg-white rounded-xl border border-gray-200 mb-3 shadow-2xs">
      <div className="flex items-center justify-between relative">
        {STATUS_STEPS.map((step, i) => {
          const isPassed = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step} className="flex-1 flex flex-col items-center relative group">
              {/* Barra conectora horizontal detrás de los círculos */}
              {i < STATUS_STEPS.length - 1 && (
                <div 
                  className={`absolute top-3.5 left-1/2 w-full h-[2px] -z-0 transition-colors duration-200 ${
                    i < currentIdx ? 'bg-blue-600' : 'bg-gray-200'
                  }`} 
                />
              )}

              {/* Botón interactivo con el estado */}
              <button
                type="button"
                onClick={() => onStatusChange && onStatusChange(step)}
                title={`Cambiar estado a "${STATUS_LABELS[step]}"`}
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                  isCurrent 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs scale-110 font-bold' 
                    : isPassed 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-white text-gray-500 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {isPassed && !isCurrent ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <span className="text-[11px] font-bold">{i + 1}</span>
                )}
              </button>

              {/* Etiqueta clicable */}
              <button
                type="button"
                onClick={() => onStatusChange && onStatusChange(step)}
                className={`text-[11px] sm:text-xs mt-1 font-bold transition-colors cursor-pointer text-center leading-tight hover:underline ${
                  isCurrent 
                    ? 'text-blue-700' 
                    : isPassed 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {STATUS_LABELS[step]}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderItems({ order }) {
  const items = order.items || order.productos || [];
  const subtotal = getOrderSubtotal(order);
  const pending = isDeliveryPending(order);

  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5 divide-y divide-gray-100">
        {items.map((p, idx) => {
          const qty = p.cantidad ?? p.quantity ?? 1;
          const name = p.nombre ?? p.name ?? 'Producto';
          const price = p.precio ?? p.price ?? 0;
          const optionsText = p.opciones_texto || 
            (Array.isArray(p.opciones) ? p.opciones.map(o => o.nombre).join(', ') : '') ||
            (Array.isArray(p.toppings) ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ') : '');
          
          return (
            <div key={idx} className="pt-1.5 first:pt-0">
              <div className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <div className="flex items-start gap-1.5 font-bold text-gray-950 leading-snug">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded font-black text-xs shrink-0">{qty}×</span>
                  <span>{name}</span>
                </div>
                <span className="text-gray-950 tabular-nums font-black shrink-0">{formatMoney(price * qty)}</span>
              </div>

              {optionsText && (
                <div className="mt-1 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-md px-2 py-0.5 inline-block">
                  ▸ {optionsText}
                </div>
              )}

              {p.nota && (
                <div className="text-[11px] font-bold text-amber-950 bg-amber-50 border border-amber-300 rounded px-2 py-0.5 mt-1 flex items-center gap-1">
                  <span>⚠️ Nota cocina:</span>
                  <span className="font-semibold">&ldquo;{p.nota}&rdquo;</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2.5 border-t border-gray-200 space-y-1 bg-gray-50 -mx-2.5 -mb-2.5 p-2.5 rounded-b-xl border-x border-b border-gray-200/80">
        <div className="flex justify-between items-center text-xs text-gray-700">
          <span>Subtotal productos</span>
          <span className="tabular-nums font-bold text-gray-900">{formatMoney(subtotal)}</span>
        </div>
        {order.entrega_metodo === 'envio' && (
          <div className="flex justify-between items-center text-xs">
            <span className={pending ? 'text-amber-800 font-bold' : 'text-gray-700'}>
              {pending ? 'Domicilio (por cotizar)' : 'Costo de envío'}
            </span>
            <span className={pending ? 'text-amber-800 font-bold' : 'text-gray-950 tabular-nums font-bold'}>
              {pending ? 'Pendiente' : formatMoney(order.delivery_fee || order.domicilio_costo || 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
          <span className="text-xs font-black text-gray-950 uppercase tracking-wider">Total a cobrar</span>
          <span className="text-base sm:text-lg font-black text-gray-950 tabular-nums">{formatMoney(order.total_amount || order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function DeliveryConfirmPanel({ order, businessName, onConfirmed }) {
  const [fee, setFee] = useState(order.delivery_fee || order.domicilio_costo || '');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const subtotal = getOrderSubtotal(order);
  const feeNum = Number(fee) || 0;
  const newTotal = subtotal + feeNum;
  const mapsUrl = order.ubicacion_link || (order.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion)}`
    : null);

  const handleConfirmAndNotify = async () => {
    if (!feeNum || feeNum <= 0) {
      addToast('Ingresa el costo del domicilio', 'warning');
      return;
    }
    setLoading(true);
    try {
      await OrderService.setDeliveryQuote(order.id, feeNum, subtotal);
      
      const customerPhone = (order.telefono || '').replace(/\D/g, '');
      const storeName = businessName || 'la tienda';
      const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://negu.pro';
      const trackingUrl = `${origin}/tracking?id=${order.id}${order.token ? `&token=${order.token}` : ''}`;
      
      const whatsappText = `Hola ${order.nombre}, el valor del domicilio para tu pedido #${order.id} en ${storeName} es de $${feeNum.toLocaleString('es-CO')}.\nTotal a pagar: $${newTotal.toLocaleString('es-CO')}.\n\nConfirma tu pedido aquí:\n${trackingUrl}`;
      
      const waUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(whatsappText)}`;
      window.open(waUrl, '_blank');

      addToast('Cotización fijada y notificada por WhatsApp', 'success');
      onConfirmed();
    } catch (err) {
      console.error(err);
      addToast('Error al fijar cotización', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-300 rounded-xl p-3 sm:p-4 space-y-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={15} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">Cotización de Domicilio Requerida</h4>
            <p className="text-[11px] sm:text-xs text-amber-900 leading-snug mt-0.5">
              Ingresa el costo manual del envío. El sistema recalculará el total y abrirá el mensaje de WhatsApp para que el cliente confirme.
            </p>
          </div>
        </div>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-amber-50/50 border border-amber-200 rounded-lg transition-all text-xs text-amber-950 font-bold group shadow-2xs"
        >
          <Map size={14} className="text-orange-600 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate flex-1">{order.direccion || 'Abrir ubicación GPS'}</span>
          <span className="text-[11px] text-orange-600 font-black uppercase shrink-0">Ver mapa ↗</span>
        </a>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <div className="relative flex-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-amber-900 mb-1">
            Costo de Domicilio ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">$</span>
            <input
              type="number"
              min="0"
              step="500"
              placeholder="Ej: 5000"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="input-field pl-7 py-2 text-xs sm:text-sm font-bold w-full bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-200"
            />
          </div>
        </div>

        <div className="sm:self-end">
          <button
            onClick={handleConfirmAndNotify}
            disabled={loading || !feeNum}
            className="w-full sm:w-auto h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
            <span>Fijar y Notificar al Cliente</span>
          </button>
        </div>
      </div>

      {feeNum > 0 && (
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-white/80 rounded-lg border border-amber-200 text-amber-950 font-medium">
          <span className="text-[11px] font-bold">Subtotal: {formatMoney(subtotal)} + Domicilio: {formatMoney(feeNum)}</span>
          <span className="text-xs sm:text-sm font-black tabular-nums text-amber-950">Total: {formatMoney(newTotal)}</span>
        </div>
      )}
    </div>
  );
}

export default function OrdersView(props) {
  const outletCtx = useOutletContext() || {};
  const orders = props.orders ?? outletCtx.orders ?? [];
  const onUpdate = props.onUpdate ?? outletCtx.reloadOrders ?? (() => {});

  const business = useBusinessStore(s => s.business);
  const businessName = business?.nombre_visible || 'Tu negocio';
  const [drivers, setDrivers] = useState([]);
  const [loadingDriver, setLoadingDriver] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('camly_order_sound') !== 'false');
  const [printingBluetoothId, setPrintingBluetoothId] = useState(null);
  const addToast = useToastStore(s => s.addToast);

  const isQuotePending = (o) => {
    const st = (o.status || o.estado || '').toString();
    const isManualQuoteType = o.delivery_type === 'custom_quote' || o.tipo_domicilio === 'manual' || isDeliveryPending(o);
    return isManualQuoteType && (st === 'COTIZACION_PENDIENTE' || isDeliveryPending(o) || !o.delivery_fee);
  };

  const handlePrintBluetooth = async (order) => {
    if (!isWebBluetoothSupported()) {
      addToast('Tu navegador actual no soporta Web Bluetooth directo. Abriendo comanda estándar para imprimir por Bluetooth del sistema...', 'info');
      printThermalReceipt(order, business);
      return;
    }
    setPrintingBluetoothId(order.id);
    addToast('Buscando impresora Bluetooth...', 'info');
    try {
      const printerName = await printOrderViaBluetooth(order, business);
      addToast(`Comanda enviada con éxito a "${printerName}"`, 'success');
    } catch (err) {
      console.warn('Bluetooth print error:', err);
      if (err.name !== 'NotFoundError') {
        addToast(err.message || 'No se pudo conectar a la impresora Bluetooth', 'error');
      }
    } finally {
      setPrintingBluetoothId(null);
    }
  };

  useEffect(() => {
    async function loadDrivers() {
      const biz = orders[0]?.negocio_id;
      if (!biz) return;
      const { data } = await getSupabase()
        .from('domiciliarios')
        .select('*')
        .eq('negocio_id', biz)
        .eq('activo', true);
      setDrivers(data || []);
    }
    loadDrivers();
  }, [orders]);

  const getStatusBadge = (status, order) => {
    const st = (status || order?.status || order?.estado || '').toString();
    const isQuoteRequired = order && isQuotePending(order);
    const bType = business?.business_type || 'general';
    const copy = getStatusCopy(st, bType);

    if (st === 'COTIZACION_PENDIENTE' || isQuoteRequired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white shadow-xs">
          <AlertCircle size={11} /> Cotización Requerida
        </span>
      );
    }
    if (st === 'COTIZACION_ENVIADA') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-100 text-sky-900 border border-sky-300">
          <Clock size={11} /> {copy.badge || 'Cotización Enviada'}
        </span>
      );
    }
    if (st === 'CONFIRMADO_GRACIA') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300 animate-pulse">
          <Clock size={11} /> Ventana Gracia (30s)
        </span>
      );
    }
    if (st === 'EN_PREPARACION' || st === 'preparando') {
      return <span className="badge badge-warning">{copy.badge || 'En Preparación'}</span>;
    }
    if (st === 'EN_CAMINO' || st === 'enviado') {
      return <span className="badge badge-info">{copy.badge || 'En Camino'}</span>;
    }
    if (st === 'ENTREGADO' || st === 'entregado') {
      return <span className="badge badge-success">{copy.badge || 'Entregado'}</span>;
    }
    if (st === 'CANCELADO' || st === 'cancelado') {
      return <span className="badge badge-error">Cancelado</span>;
    }
    return <span className="badge badge-neutral">{st || 'Nuevo'}</span>;
  };

  const isOrderNew = (o) => {
    const s = (o.status || o.estado || '').toString().toLowerCase();
    return ['nuevo', 'recibido', 'pendiente', 'confirmado_gracia'].includes(s) && !isQuotePending(o);
  };

  const getTabCount = (tabId) => {
    if (tabId === 'all') return orders.length;
    if (tabId === 'nuevo') return orders.filter(isOrderNew).length;
    if (tabId === 'cotizacion') return orders.filter(isQuotePending).length;
    if (tabId === 'preparando') return orders.filter(o => ['preparando', 'en_preparacion'].includes((o.status || o.estado || '').toLowerCase())).length;
    if (tabId === 'enviado') return orders.filter(o => ['enviado', 'en_camino'].includes((o.status || o.estado || '').toLowerCase())).length;
    if (tabId === 'entregado') return orders.filter(o => ['entregado'].includes((o.status || o.estado || '').toLowerCase())).length;
    if (tabId === 'cancelado') return orders.filter(o => ['cancelado'].includes((o.status || o.estado || '').toLowerCase())).length;
    return orders.filter(o => (o.estado || o.status) === tabId).length;
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : activeFilter === 'nuevo'
    ? orders.filter(isOrderNew)
    : activeFilter === 'cotizacion'
    ? orders.filter(isQuotePending)
    : activeFilter === 'preparando'
    ? orders.filter(o => ['preparando', 'en_preparacion'].includes((o.status || o.estado || '').toLowerCase()))
    : activeFilter === 'enviado'
    ? orders.filter(o => ['enviado', 'en_camino'].includes((o.status || o.estado || '').toLowerCase()))
    : activeFilter === 'entregado'
    ? orders.filter(o => ['entregado'].includes((o.status || o.estado || '').toLowerCase()))
    : activeFilter === 'cancelado'
    ? orders.filter(o => ['cancelado'].includes((o.status || o.estado || '').toLowerCase()))
    : orders.filter(o => (o.estado || o.status) === activeFilter);

  const handleNotifyCustomerDispatch = (order) => {
    const customerPhone = (order.telefono || '').replace(/\D/g, '');
    if (!customerPhone) {
      addToast('El pedido no tiene teléfono registrado', 'warning');
      return;
    }
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://negu.pro';
    const trackingUrl = `${origin}/tracking?id=${order.id}${order.token ? `&token=${order.token}` : ''}`;
    const storeName = businessName || 'la tienda';
    const message = `Hola ${order.nombre}, tu pedido #${order.id} en ${storeName} ya va en camino hacia tu dirección.\n\nPuedes ver el estado de tu entrega aquí:\n${trackingUrl}`;
    window.open(`https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onUpdate();
      if (newStatus === 'enviado' || newStatus === 'EN_CAMINO') {
        const order = orders.find(o => o.id === orderId);
        if (order && order.entrega_metodo === 'envio') {
          handleNotifyCustomerDispatch(order);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al eliminar el pedido.');
    }
  };

  const handleDeleteClick = (e, order) => {
    e.stopPropagation();
    setOrderToDelete(order);
  };

  const handleAssignDriver = async (orderId, driverId) => {
    setLoadingDriver(orderId);
    try {
      const { error } = await getSupabase()
        .from('pedidos')
        .update({ domiciliario_id: driverId || null })
        .eq('id', orderId);
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDriver(null);
    }
  };

  const handleDispatch = (order) => {
    const driver = drivers.find(d => d.id === order.domiciliario_id);
    if (!driver) return;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion || '')}`;
    const message = `PEDIDO ASIGNADO\n\nCliente: ${order.nombre}\nTel: ${order.telefono}\nDirección: ${order.direccion || 'Ver mapa'}\nGoogle Maps: ${mapsLink}\n\nTotal: ${formatMoney(order.total)}`;
    window.open(`https://wa.me/${driver.telefono}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Filter tabs & Sound toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 flex-1">
          {STATUS_TABS.map(tab => {
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors shrink-0
                  ${activeFilter === tab.id 
                    ? tab.id === 'cotizacion' ? 'bg-amber-600 text-white shadow-xs' : 'bg-gray-900 text-white shadow-xs'
                    : tab.id === 'cotizacion' && count > 0 ? 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100' : 'bg-white border border-border text-gray-700 hover:text-gray-950'}`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === tab.id ? 'bg-white/20' : tab.id === 'cotizacion' && count > 0 ? 'bg-amber-200 text-amber-950 font-black' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timbre de nuevos pedidos */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              localStorage.setItem('camly_order_sound', next ? 'true' : 'false');
              if (next) playNewOrderSound();
            }}
            title={soundEnabled ? 'Silenciar timbre de pedidos' : 'Activar timbre de pedidos'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              soundEnabled 
                ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 size={14} className="text-orange-600 animate-pulse" />
                <span>Timbre activo</span>
              </>
            ) : (
              <>
                <VolumeX size={14} />
                <span>Timbre mudo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-1.5">
        {filteredOrders.map((order) => {
          const status = order.estado || order.status;
          const deliveryPending = isDeliveryPending(order);
          const isExpanded = expandedOrderId === order.id;

          const borderAccent = deliveryPending
            ? 'border-l-4 border-l-amber-500'
            : status === 'nuevo'
            ? 'border-l-4 border-l-orange-500'
            : status === 'preparando'
            ? 'border-l-4 border-l-amber-500'
            : status === 'enviado'
            ? 'border-l-4 border-l-blue-500'
            : 'border-l-4 border-l-emerald-500';

          return (
            <div 
              key={order.id} 
              className={`card transition-colors duration-150 overflow-hidden ${borderAccent} border-gray-200/80 shadow-xs`}
            >
              <div 
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) setExpandedOrderId(isExpanded ? null : order.id); }}
                className="px-3 py-2.5 sm:px-4 cursor-pointer hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    #{order.id.toString().slice(-4).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{order.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        {order.entrega_metodo === 'envio' ? <Bike size={12} /> : <MapPin size={12} />}
                        {order.entrega_metodo === 'envio' ? 'Domicilio' : 'Local'}
                      </span>
                      {deliveryPending && (
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Por cotizar</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatMoney(order.total)}</p>
                    {deliveryPending && (
                      <p className="text-[10px] text-amber-600 font-medium">+ domicilio</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(status, order)}
                    {status !== 'CANCELADO' && status !== 'cancelado' && status !== 'ENTREGADO' && status !== 'entregado' && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToCancel(order);
                        }}
                        className="btn-ghost p-1.5 tap-target text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Cancelar pedido con motivo"
                      >
                        <Ban size={15} />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        printThermalReceipt(order, business);
                      }}
                      className="btn-ghost p-1.5 tap-target text-gray-400 hover:text-gray-900"
                      title="Imprimir comanda térmica (58/80mm)"
                    >
                      <Printer size={15} />
                    </button>
                    <button 
                      type="button"
                      disabled={printingBluetoothId === order.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintBluetooth(order);
                      }}
                      className="btn-ghost p-1.5 tap-target text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Imprimir vía Bluetooth directo (POS-58/80)"
                    >
                      {printingBluetoothId === order.id ? <Loader2 size={15} className="animate-spin text-blue-600" /> : <Bluetooth size={15} />}
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, order)}
                      className="btn-ghost p-1.5 tap-target text-gray-400 hover:text-red-600"
                      title="Eliminar pedido"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3.5 pt-1 sm:px-4 border-t border-border animate-fade-in-down bg-gray-50/50">
                  {/* Banner de Cancelación si está cancelado */}
                  {(status === 'CANCELADO' || status === 'cancelado') && (
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-700 mb-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="font-bold text-gray-900">Pedido cancelado</span>
                        <span className="text-gray-500">
                          · por {order.cancelled_by === 'customer' ? 'el cliente' : order.cancelled_by === 'merchant' ? 'el comercio' : 'sistema'}
                        </span>
                      </div>
                      {order.cancellation_reason && (
                        <span className="text-gray-600 text-[11px] font-medium truncate max-w-[240px]" title={order.cancellation_reason}>
                          {order.cancellation_reason}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Banner de Ventana de Gracia */}
                  {(status === 'CONFIRMADO_GRACIA' || order.status === 'CONFIRMADO_GRACIA') && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 mb-3 shadow-2xs">
                      <Clock size={15} className="text-blue-600 shrink-0" />
                      <p className="font-medium">
                        Cotización aceptada por el cliente. Entrando a cocina en 30 segundos.
                      </p>
                    </div>
                  )}

                  {/* Comprobante de Pago adjunto */}
                  {order.payment_receipt_url && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs mb-3 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-emerald-700 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-emerald-950 truncate">Comprobante de Pago Subido</p>
                          <p className="text-[11px] text-emerald-800">Método: <span className="font-semibold">{order.payment_method || 'Transferencia'}</span> · Estado: <span className="font-black uppercase">{order.payment_status || 'pending'}</span></p>
                        </div>
                      </div>
                      <a
                        href={order.payment_receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs shrink-0"
                      >
                        <span>Ver Comprobante</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  {/* Stepper sólo si NO está cancelado */}
                  {status !== 'CANCELADO' && status !== 'cancelado' && (
                    <OrderTimeline 
                      currentStatus={status} 
                      onStatusChange={(newSt) => handleStatusChange(order.id, newSt)} 
                    />
                  )}

                  {/* Panel de fijar cotización para el comercio */}
                  {(deliveryPending || order.status === 'COTIZACION_PENDIENTE' || isQuotePending(order)) && status !== 'CANCELADO' && status !== 'cancelado' && (
                    <div className="mb-3">
                      <DeliveryConfirmPanel 
                        order={order} 
                        businessName={businessName} 
                        onConfirmed={onUpdate} 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
                    {/* Columna 1: Cliente, Entrega y Repartidor */}
                    <div className="space-y-2.5 flex flex-col justify-between">
                      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Datos de entrega</p>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            order.entrega_metodo === 'envio' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {order.entrega_metodo === 'envio' ? '🛵 Domicilio' : '🏪 Recogida en local'}
                          </span>
                        </div>

                        {/* Cliente y Teléfono / WhatsApp */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <User size={15} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-gray-950 truncate leading-tight">{order.nombre}</p>
                              <a href={`tel:${order.telefono}`} className="text-xs font-bold text-blue-700 hover:underline leading-tight block mt-0.5">
                                {order.telefono}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {order.entrega_metodo === 'envio' && (
                              <button 
                                type="button"
                                onClick={() => handleNotifyCustomerDispatch(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
                                title="Enviar WhatsApp al cliente avisando que el pedido va en camino con el link de seguimiento"
                              >
                                <Bike size={13} />
                                <span>Avisar envío</span>
                              </button>
                            )}
                            <a 
                              href={`https://wa.me/${order.telefono?.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors shrink-0"
                              title="Abrir chat en WhatsApp"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Dirección y GPS */}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-start gap-1.5 text-xs text-gray-800">
                            <MapPin size={15} className="text-blue-600 mt-0.5 shrink-0" />
                            <p className="leading-snug break-words font-semibold text-gray-950">
                              {order.direccion || 'Recogida en tienda física'}
                            </p>
                          </div>

                          {order.entrega_metodo === 'envio' && (order.ubicacion_link || order.direccion) && (
                            <a
                              href={order.ubicacion_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition-all text-xs text-blue-950 font-bold group"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Map size={14} className="text-blue-700 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="truncate">Ver ubicación en Google Maps</span>
                              </div>
                              <span className="text-[11px] text-blue-700 font-bold shrink-0">Abrir ↗</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Repartidor asignado */}
                      <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Repartidor asignado</p>
                          {order.domiciliario_id && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Asignado</span>
                          )}
                        </div>

                        <div className="flex gap-2 items-center">
                          <button 
                            type="button"
                            disabled={loadingDriver === order.id}
                            onClick={() => setSelectedOrderForDriver(order)}
                            className="input-field text-xs flex items-center justify-between min-w-0 flex-1 truncate py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer font-bold text-gray-900"
                          >
                            <span className="truncate">
                              {drivers.find(d => d.id === order.domiciliario_id)?.nombre || 'Seleccionar repartidor...'}
                            </span>
                            <ChevronRight size={14} className="rotate-90 text-gray-500 shrink-0 ml-1" />
                          </button>

                          {order.domiciliario_id && (
                            <button 
                              onClick={() => handleDispatch(order)} 
                              className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                            >
                              Despachar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Detalle de productos y Barra de acciones */}
                    <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Productos del pedido</p>
                          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            {(order.items || order.productos || []).length} items
                          </span>
                        </div>
                        <OrderItems order={order} />
                      </div>

                      {/* Botones de comanda, impresión y cancelación */}
                      <div className="mt-3 pt-2.5 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => printThermalReceipt(order, business)}
                            className="h-8 rounded-lg border border-gray-300 hover:border-gray-900 bg-white text-gray-800 hover:text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Imprimir comanda térmica estándar para cocina"
                          >
                            <Printer size={14} className="shrink-0" />
                            <span className="truncate">Comanda cocina</span>
                          </button>

                          <button
                            type="button"
                            disabled={printingBluetoothId === order.id}
                            onClick={() => handlePrintBluetooth(order)}
                            className="h-8 rounded-lg border border-blue-200 hover:border-blue-400 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Imprimir directamente a impresora térmica Bluetooth (POS-58/80)"
                          >
                            {printingBluetoothId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Bluetooth size={14} className="shrink-0" />}
                            <span className="truncate">POS Bluetooth</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="h-8 rounded-lg border border-rose-200 hover:border-rose-400 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer col-span-2 mt-1"
                            title="Cancelar este pedido y seleccionar motivo"
                          >
                            <Ban size={14} className="shrink-0" />
                            <span>Cancelar Pedido</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="py-10 text-center card border-dashed p-6">
            <Package size={28} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-semibold text-gray-800">No hay pedidos en esta sección</p>
            <p className="text-xs text-gray-500 mt-1">Los nuevos pedidos de tus clientes aparecerán aquí automáticamente.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!orderToDelete}
        title="Eliminar Pedido"
        message={`¿Estás seguro de que deseas eliminar permanentemente el pedido de "${orderToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setOrderToDelete(null)}
      />

      <MerchantCancelModal
        isOpen={!!orderToCancel}
        order={orderToCancel}
        onClose={() => setOrderToCancel(null)}
        onConfirmed={onUpdate}
      />

      <DriverSelectModal
        isOpen={!!selectedOrderForDriver}
        drivers={drivers}
        currentDriverId={selectedOrderForDriver?.domiciliario_id}
        loading={loadingDriver === selectedOrderForDriver?.id}
        onSelect={async (driverId) => {
          if (selectedOrderForDriver) {
            await handleAssignDriver(selectedOrderForDriver.id, driverId);
            setSelectedOrderForDriver(null);
          }
        }}
        onClose={() => setSelectedOrderForDriver(null)}
      />
    </div>
  );
}

function DriverSelectModal({ isOpen, onClose, drivers, currentDriverId, onSelect, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-xl animate-fade-in-up border border-border">
        
        <div className="p-5 border-b border-border flex items-center justify-between">
           <div>
              <h2 className="text-base font-semibold text-gray-900">
                Asignar Repartidor
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Selecciona un domiciliario para el pedido
              </p>
           </div>
           <button 
             onClick={onClose}
             className="btn-ghost p-1.5 text-gray-400 hover:text-gray-800"
           >
             <X size={16} />
           </button>
        </div>

        {/* Drivers list */}
        <div className="max-h-[300px] overflow-y-auto p-4 space-y-1.5">
          <button
            onClick={() => onSelect(null)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-colors
              ${!currentDriverId 
                ? 'border-orange-500 bg-orange-50 text-orange-900' 
                : 'border-border bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-2.5">
              <User size={15} className="text-gray-400" />
              <span>Sin asignar</span>
            </div>
          </button>

          {drivers.map((d) => {
            const isAssigned = d.id === currentDriverId;
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left text-xs font-medium transition-colors
                  ${isAssigned 
                    ? 'border-orange-500 bg-orange-50 text-orange-900' 
                    : 'border-border bg-white text-gray-800 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-semibold flex items-center justify-center text-[10px] shrink-0">
                    {d.nombre.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.nombre}</p>
                    <p className="text-[10px] text-gray-500">{d.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
                {isAssigned && (
                  <CheckCircle2 size={16} className="text-orange-600 shrink-0" />
                )}
              </button>
            );
          })}

          {drivers.length === 0 && (
            <div className="py-6 text-center text-gray-400 text-xs">
              No tienes domiciliarios registrados aún.
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <Loader2 className="animate-spin text-orange-600" size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
