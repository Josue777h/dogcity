import { useState, useEffect } from 'react';
import { 
  ChevronRight, User, MapPin, Package, Bike, Trash2, Map,
  MessageCircle, Loader2, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { 
  formatMoney, getOrderSubtotal, isDeliveryPending, 
  buildDeliveryConfirmationMessage, openWhatsApp 
} from '../../../lib/utils';
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

function OrderTimeline({ currentStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-0 py-3">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${
              i <= currentIdx ? 'bg-orange-600 border-orange-600' : 'bg-white border-gray-300'
            }`} />
            <span className={`text-[10px] font-medium hidden sm:block ${i <= currentIdx ? 'text-orange-600' : 'text-gray-400'}`}>
              {STATUS_LABELS[step]}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 transition-all duration-300 ${i < currentIdx ? 'bg-orange-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderItems({ order }) {
  const items = order.items || order.productos || [];
  const subtotal = getOrderSubtotal(order);
  const pending = isDeliveryPending(order);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {items.map((p, idx) => {
          const qty = p.cantidad ?? p.quantity ?? 1;
          const name = p.nombre ?? p.name ?? 'Producto';
          const price = p.precio ?? p.price ?? 0;
          return (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-800">{qty}× {name}</span>
              <span className="text-gray-500 tabular-nums">{formatMoney(price * qty)}</span>
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t border-gray-200 space-y-1.5">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Subtotal productos</span>
          <span className="tabular-nums">{formatMoney(subtotal)}</span>
        </div>
        {order.entrega_metodo === 'envio' && (
          <div className="flex justify-between items-center text-xs">
            <span className={pending ? 'text-amber-700 font-medium' : 'text-gray-500'}>
              {pending ? 'Domicilio (por confirmar)' : 'Domicilio'}
            </span>
            <span className={pending ? 'text-amber-700 font-medium' : 'text-gray-700 tabular-nums'}>
              {pending ? 'Pendiente' : formatMoney(order.domicilio_costo || 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-xs font-semibold text-gray-700">Total</span>
          <span className="text-base font-semibold text-gray-900 tabular-nums">{formatMoney(order.total)}</span>
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
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-amber-900">Confirmar costo de domicilio</h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Revisa la ubicación, ingresa el costo de entrega y envía el total final al cliente por WhatsApp.
          </p>
        </div>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-md hover:border-amber-300 transition-colors text-xs text-amber-900"
        >
          <Map size={14} className="text-amber-600 shrink-0" />
          <span className="truncate">{order.direccion || 'Abrir ubicación GPS'}</span>
        </a>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          min="0"
          step="500"
          placeholder="Costo de entrega (ej: 4000)"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="input-field text-sm flex-1"
        />
        <button
          onClick={handleConfirm}
          disabled={loading || !feeNum}
          className="btn-whatsapp py-2 px-4 text-xs font-semibold disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
          Confirmar y notificar
        </button>
      </div>

      {feeNum > 0 && (
        <div className="flex items-center justify-between text-xs pt-1 text-amber-900 font-medium">
          <span>Nuevo total a cobrar:</span>
          <span className="text-sm font-semibold tabular-nums">{formatMoney(newTotal)}</span>
        </div>
      )}
    </div>
  );
}

export default function OrdersView({ orders, onUpdate }) {
  const business = useBusinessStore(s => s.business);
  const businessName = business?.nombre_visible || 'Tu negocio';
  const [drivers, setDrivers] = useState([]);
  const [loadingDriver, setLoadingDriver] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState(null);

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
    <div className="space-y-4 animate-fade-in-up">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
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

      {/* Orders List */}
      <div className="space-y-2">
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
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="px-4 py-3.5 sm:px-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-gray-900 tabular-nums">{formatMoney(order.total)}</p>
                    {deliveryPending && (
                      <p className="text-[10px] text-amber-600 font-medium">+ domicilio</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
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
                <div className="px-4 pb-5 pt-2 sm:px-5 border-t border-border animate-fade-in-down bg-gray-50/50">
                  <OrderTimeline currentStatus={status} />

                  {deliveryPending && (
                    <div className="mb-4">
                      <DeliveryConfirmPanel 
                        order={order} 
                        businessName={businessName} 
                        onConfirmed={onUpdate} 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    {/* Delivery Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="caps-label mb-2">Cliente y Entrega</p>
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          {order.nombre} · <a href={`tel:${order.telefono}`} className="text-orange-600 hover:underline">{order.telefono}</a>
                        </p>
                        <p className="text-xs text-gray-600 mt-1.5 flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                          {order.direccion || 'Recogida en local'}
                        </p>
                      </div>

                      {order.entrega_metodo === 'envio' && (order.ubicacion_link || order.direccion) && (
                        <a
                          href={order.ubicacion_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-white hover:border-orange-300 transition-colors text-xs text-gray-700"
                        >
                          <Map size={16} className="text-orange-600 shrink-0" />
                          <span className="font-medium">Abrir ubicación GPS en Google Maps</span>
                        </a>
                      )}

                      {/* Repartidor */}
                      <div className="pt-3 border-t border-border">
                        <p className="caps-label mb-2">Repartidor asignado</p>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            disabled={loadingDriver === order.id}
                            onClick={() => setSelectedOrderForDriver(order)}
                            className="input-field text-xs flex items-center justify-between"
                          >
                            <span>{drivers.find(d => d.id === order.domiciliario_id)?.nombre || 'Sin asignar'}</span>
                            <ChevronRight size={14} className="rotate-90 text-gray-400" />
                          </button>
                          {order.domiciliario_id && (
                            <button onClick={() => handleDispatch(order)} className="btn-secondary text-xs px-3">
                              Despachar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Products & Status Changer */}
                    <div className="card p-4 bg-white">
                      <p className="caps-label mb-2">Detalle de productos</p>
                      <OrderItems order={order} />

                      <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-2">
                        <a 
                          href={`https://wa.me/${order.telefono?.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-whatsapp py-2 px-3 text-xs flex-1"
                        >
                          <MessageCircle size={14} /> Chatear con cliente
                        </a>
                        <select 
                          value={status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="input-field text-xs py-2 flex-1"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="preparando">Preparando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center card border-dashed p-8">
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
