import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  ChevronRight, User, MapPin, Package, Bike, Trash2, Map,
  MessageCircle, Loader2, AlertCircle, CheckCircle2, Check, X, Printer, Volume2, VolumeX, Bluetooth
} from 'lucide-react';
import { 
  formatMoney, getOrderSubtotal, isDeliveryPending, 
  buildDeliveryConfirmationMessage, openWhatsApp,
  printThermalReceipt, playNewOrderSound
} from '../../../lib/utils';
import { isWebBluetoothSupported, printOrderViaBluetooth } from '../../../lib/bluetoothPrinter';
import { updateOrderStatus, confirmOrderDelivery, getSupabase, deleteOrder } from '../../../lib/supabase';
import { useBusinessStore, useToastStore } from '../../../stores';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const STATUS_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'nuevo', label: 'Nuevos' },
  { id: 'preparando', label: 'Preparando' },
  { id: 'enviado', label: 'Enviados' },
  { id: 'entregado', label: 'Entregados' },
];

const STATUS_STEPS = ['nuevo', 'preparando', 'enviado', 'entregado'];
const STATUS_LABELS = { nuevo: 'Nuevo', preparando: 'Preparando', enviado: 'Enviado', entregado: 'Entregado' };

function OrderTimeline({ currentStatus, onStatusChange }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
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
          const optionsText = p.opciones_texto || (Array.isArray(p.toppings) ? p.toppings.map(t => typeof t === 'string' ? t : t.nombre).join(', ') : '');
          
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
                <div className="text-xs font-medium text-amber-950 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-1">
                  <strong>Nota:</strong> &ldquo;{p.nota}&rdquo;
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
              {pending ? 'Pendiente' : formatMoney(order.domicilio_costo || 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
          <span className="text-xs font-black text-gray-950 uppercase tracking-wider">Total a cobrar</span>
          <span className="text-base sm:text-lg font-black text-gray-950 tabular-nums">{formatMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function DeliveryConfirmPanel({ order, businessName, onConfirmed }) {
  const [fee, setFee] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const subtotal = getOrderSubtotal(order);
  const feeNum = Number(fee) || 0;
  const newTotal = subtotal + feeNum;
  const mapsUrl = order.ubicacion_link || (order.direccion
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion)}`
    : null);

  const handleConfirm = async () => {
    if (!feeNum || feeNum <= 0) {
      addToast('Ingresa el costo del domicilio', 'warning');
      return;
    }
    setLoading(true);
    try {
      await confirmOrderDelivery(order.id, feeNum, newTotal);
      const trackingUrl = order.token
        ? `${window.location.origin}/tracking?id=${order.id}&token=${order.token}`
        : '';
      const message = buildDeliveryConfirmationMessage(order, businessName, feeNum, trackingUrl);
      const phone = order.telefono?.replace(/\D/g, '');
      openWhatsApp(phone, message);
      addToast('Domicilio confirmado y enviado al cliente', 'success');
      onConfirmed();
    } catch (err) {
      console.error(err);
      addToast('Error al confirmar domicilio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/90 rounded-lg p-2.5 sm:p-3 space-y-2 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle size={13} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950">Confirmar costo de domicilio</h4>
            <p className="text-[11px] text-amber-800 leading-snug">
              Ingresa el valor de la entrega para actualizar el total y enviar la confirmación por WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-2.5 py-1.5 bg-white/90 hover:bg-white border border-amber-200 rounded-md transition-all text-xs text-amber-950 font-medium group shadow-2xs"
        >
          <Map size={13} className="text-orange-600 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate flex-1">{order.direccion || 'Abrir ubicación GPS'}</span>
          <span className="text-[10px] text-orange-600 font-bold uppercase shrink-0">Ver mapa ↗</span>
        </a>
      )}

      <div className="flex flex-col sm:flex-row gap-1.5 pt-0.5">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="Costo de entrega (ej: 4000)"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="input-field pl-6 py-1.5 text-xs sm:text-sm font-semibold w-full bg-white"
          />
        </div>
        <button
          onClick={handleConfirm}
          disabled={loading || !feeNum}
          className="btn-whatsapp py-2 px-3.5 text-xs font-bold shrink-0 justify-center shadow-xs disabled:opacity-50"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
          <span>Confirmar y notificar WhatsApp</span>
        </button>
      </div>

      {feeNum > 0 && (
        <div className="flex items-center justify-between text-xs px-1 pt-1 text-amber-950 font-medium border-t border-amber-200/60">
          <span className="text-[11px]">Nuevo total a cobrar (con domicilio):</span>
          <span className="text-sm font-black tabular-nums text-amber-900">{formatMoney(newTotal)}</span>
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('camly_order_sound') !== 'false');
  const [printingBluetoothId, setPrintingBluetoothId] = useState(null);
  const addToast = useToastStore(s => s.addToast);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'nuevo': return <span className="badge badge-error">Nuevo</span>;
      case 'preparando': return <span className="badge badge-warning">Preparando</span>;
      case 'enviado': return <span className="badge badge-info">Enviado</span>;
      case 'entregado': return <span className="badge badge-success">Entregado</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : activeFilter === 'dom_pendiente'
    ? orders.filter(isDeliveryPending)
    : orders.filter(o => (o.estado || o.status) === activeFilter);

  const pendingCount = orders.filter(isDeliveryPending).length;

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onUpdate();
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
            const count = tab.id === 'all' ? orders.length : orders.filter(o => (o.estado || o.status) === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                  ${activeFilter === tab.id 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white border border-border text-gray-600 hover:text-gray-900'}`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === tab.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          {pendingCount > 0 && (
            <button
              onClick={() => setActiveFilter('dom_pendiente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                ${activeFilter === 'dom_pendiente' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'}`}
            >
              Dom. pendiente
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === 'dom_pendiente' ? 'bg-white/20' : 'bg-amber-200 text-amber-900'}`}>
                {pendingCount}
              </span>
            </button>
          )}
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
                    {getStatusBadge(status)}
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
                  <OrderTimeline 
                    currentStatus={status} 
                    onStatusChange={(newSt) => handleStatusChange(order.id, newSt)} 
                  />

                  {deliveryPending && (
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

                      {/* Botones de comanda e impresión */}
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
