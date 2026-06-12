import { useState, useEffect } from 'react';
import { 
  ChevronRight, User, MapPin, Package, Bike, Trash2, Map,
  MessageCircle, Loader2, AlertCircle, CheckCircle2
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
    <div className="flex items-center gap-0 py-4">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
              i <= currentIdx ? 'bg-brand border-brand shadow-sm shadow-brand/30' : 'bg-white border-border'
            } ${i === currentIdx && step === 'nuevo' ? 'pulse-new' : ''}`} />
            <span className={`text-[8px] font-black uppercase tracking-widest hidden sm:block ${i <= currentIdx ? 'text-brand' : 'text-muted'}`}>
              {STATUS_LABELS[step]}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${i < currentIdx ? 'bg-brand' : 'bg-border'}`} />
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
    <>
      <div className="space-y-2">
        {items.map((p, idx) => {
          const qty = p.cantidad ?? p.quantity ?? 1;
          const name = p.nombre ?? p.name ?? 'Producto';
          const price = p.precio ?? p.price ?? 0;
          return (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="font-bold text-dark">{qty}x {name}</span>
              <span className="font-black text-muted opacity-60 text-[10px]">{formatMoney(price * qty)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black text-muted uppercase tracking-widest">
          <span>Subtotal productos</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {order.entrega_metodo === 'envio' && (
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className={pending ? 'text-amber-600' : 'text-muted'}>
              {pending ? 'Domicilio (pendiente)' : 'Domicilio'}
            </span>
            <span className={pending ? 'text-amber-600' : 'text-brand'}>
              {pending ? 'Por confirmar' : formatMoney(order.domicilio_costo || 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-border/30">
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total</span>
          <span className="text-lg font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
        </div>
      </div>
    </>
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
      addToast('Domicilio confirmado — WhatsApp enviado al cliente', 'success');
      onConfirmed();
    } catch (err) {
      console.error(err);
      addToast('Error al confirmar domicilio', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 space-y-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest">Confirmar costo de domicilio</h4>
          <p className="text-[10px] text-amber-700/80 font-medium mt-1 leading-relaxed">
            Revisa la ubicación del cliente, ingresa el costo y envía el total final con un clic — sin calcular a mano.
          </p>
        </div>
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 p-3 bg-white border border-amber-500/20 rounded-xl hover:border-amber-500/50 transition-colors"
        >
          <Map size={18} className="text-amber-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-dark uppercase tracking-widest">Ver ubicación del cliente</p>
            <p className="text-[9px] text-muted truncate">{order.direccion || 'Abrir en Google Maps'}</p>
          </div>
        </a>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-border text-center">
          <p className="text-[9px] font-black text-muted uppercase tracking-widest">Subtotal</p>
          <p className="text-sm font-black text-dark mt-0.5">{formatMoney(subtotal)}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-amber-500/30 text-center">
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">+ Domicilio</p>
          <p className="text-sm font-black text-amber-700 mt-0.5">{feeNum > 0 ? formatMoney(feeNum) : '—'}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="number"
          min="0"
          step="500"
          placeholder="Ej: 5000"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          className="flex-1 p-3 bg-white border-2 border-amber-500/30 rounded-xl font-black text-brand text-sm outline-none focus:border-amber-500 input-glow"
        />
        <button
          onClick={handleConfirm}
          disabled={loading || !feeNum}
          className="btn-primary !bg-success !py-3 !px-5 shadow-lg shadow-success/20 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">Enviar total</span>
        </button>
      </div>

      {feeNum > 0 && (
        <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-xl">
          <span className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={14} /> Total final al cliente
          </span>
          <span className="text-lg font-black text-success">{formatMoney(newTotal)}</span>
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'nuevo': return 'bg-brand text-white shadow-brand/20';
      case 'preparando': return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'enviado': return 'bg-blue-500 text-white shadow-blue-500/20';
      case 'entregado': return 'bg-emerald-500 text-white shadow-emerald-500/20';
      default: return 'bg-slate-400 text-white';
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
    const message = `NUEVO PEDIDO ASIGNADO\n\nCliente: ${order.nombre}\nTel: ${order.telefono}\nDirección: ${order.direccion || 'Ver mapa'}\nGoogle Maps: ${mapsLink}\n\nValor: ${formatMoney(order.total)}`;
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0
                ${activeFilter === tab.id 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'bg-white border border-border text-muted hover:border-brand/30 hover:text-brand'}`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === tab.id ? 'bg-white/20' : 'bg-bg-alt'}`}>
                {count}
              </span>
            </button>
          );
        })}
        {pendingCount > 0 && (
          <button
            onClick={() => setActiveFilter('dom_pendiente')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0
              ${activeFilter === 'dom_pendiente' 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-500/20'}`}
          >
            Dom. pendiente
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeFilter === 'dom_pendiente' ? 'bg-white/20' : 'bg-white'}`}>
              {pendingCount}
            </span>
          </button>
        )}
      </div>

      {/* Header List */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] items-center">
        <span className="col-span-2 pl-2">Pedido</span>
        <span className="col-span-4">Cliente</span>
        <span className="col-span-2 text-center">Total</span>
        <span className="col-span-2 text-center">Estado</span>
        <span className="col-span-2 text-center">Acciones</span>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, i) => {
          const status = order.estado || order.status;
          const deliveryPending = isDeliveryPending(order);
          return (
            <div key={order.id} className={`bg-white border rounded-3xl overflow-hidden hover:border-brand/40 transition-all duration-300 shadow-sm hover:shadow-xl animate-fade-in-up stagger-${(i % 5) + 1} ${deliveryPending ? 'border-amber-400/60 ring-1 ring-amber-400/20' : 'border-border'}`} style={{ animationFillMode: 'both' }}>
              <div 
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="px-4 py-3 sm:px-6 cursor-pointer flex flex-col gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-12 sm:gap-4 sm:items-center relative"
              >
                <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-3 w-full pr-16 lg:pr-0">
                  <div className="px-3 py-1.5 bg-brand text-white rounded-full font-black text-[10px] tracking-widest leading-none shadow-sm">
                    #{order.id.toString().slice(-4).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex flex-col justify-center">
                  <p className="text-xs font-black text-dark uppercase tracking-tight truncate pr-8 lg:pr-0">{order.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {order.entrega_metodo === 'envio' ? <Bike size={10} className="text-brand"/> : <MapPin size={10} className="text-brand"/>}
                    <p className="text-[9px] text-muted font-black tracking-widest uppercase">{order.entrega_metodo === 'envio' ? 'DOMICILIO' : 'LOCAL'}</p>
                    {deliveryPending && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-500/15 text-amber-700 rounded-md pulse-new">
                        Dom. pendiente
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:contents">
                <div className="sm:col-span-1 lg:col-span-2 flex flex-col items-start sm:items-center lg:justify-center">
                  <span className="text-sm font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
                  {deliveryPending && (
                    <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">+ domicilio</span>
                  )}
                </div>

                <div className="sm:col-span-1 lg:col-span-2 flex items-center sm:justify-center">
                  <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest sm:w-full lg:w-auto text-center shadow-sm ${getStatusColor(status)} ${status === 'nuevo' ? 'pulse-new' : ''}`}>
                    {status}
                  </span>
                </div>
                </div>

                <div className="hidden lg:flex lg:col-span-2 items-center justify-center gap-2">
                  <button 
                    onClick={(e) => handleDeleteClick(e, order)}
                    className="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-100"
                    title="Eliminar pedido"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-9 h-9 flex items-center justify-center text-muted hover:text-brand bg-bg-alt rounded-full transition-colors">
                    <ChevronRight size={18} className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                <div className="lg:hidden absolute right-4 top-3 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-2 z-10">
                  <button 
                    onClick={(e) => handleDeleteClick(e, order)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-full transition-all border border-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="w-8 h-8 flex items-center justify-center text-muted hover:text-brand bg-bg-alt rounded-full">
                    <ChevronRight size={16} className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="px-6 pb-6 pt-2 border-t border-dashed border-border animate-fade-in-down">
                  <OrderTimeline currentStatus={status} />

                  {deliveryPending && (
                    <div className="mb-6">
                      <DeliveryConfirmPanel 
                        order={order} 
                        businessName={businessName} 
                        onConfirmed={onUpdate} 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Detalles de Entrega</h4>
                        <p className="text-xs font-bold text-dark flex items-center gap-2"><User size={14}/> {order.nombre} - <span className="text-brand">{order.telefono}</span></p>
                        <p className="text-xs text-muted font-medium mt-2 flex items-start gap-2 italic"><MapPin size={14}/> {order.direccion || 'Recogida en local'}</p>
                      </div>

                      {order.entrega_metodo === 'envio' && (order.ubicacion_link || order.direccion) && (
                        <a
                          href={order.ubicacion_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.direccion)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl overflow-hidden border border-border bg-bg-alt h-32 flex items-center justify-center relative group cursor-pointer hover:border-brand/40 transition-colors"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-accent/5" />
                          <div className="relative flex flex-col items-center gap-2 text-muted group-hover:text-brand transition-colors">
                            <Map size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ver ubicación GPS del cliente</span>
                          </div>
                        </a>
                      )}

                      <div className="pt-4 border-t border-border">
                        <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Gestión de Envío</h4>
                        <div className="flex gap-2">
                          <select 
                            disabled={loadingDriver === order.id}
                            value={order.domiciliario_id || ''}
                            onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                            className="flex-1 bg-bg-alt border border-border px-4 py-2.5 rounded-xl text-[10px] font-black text-dark outline-none input-glow"
                          >
                            <option value="">Sin asignar</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                          </select>
                          {order.domiciliario_id && (
                            <button onClick={() => handleDispatch(order)} className="px-4 py-2 bg-dark text-white rounded-xl text-[9px] font-black uppercase hover:bg-dark/90 transition-colors">Despachar</button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-bg-alt/50 rounded-2xl p-6">
                      <h4 className="text-[10px] font-black text-dark uppercase tracking-[0.2em] mb-4">Productos</h4>
                      <OrderItems order={order} />

                      <div className="mt-6 flex gap-2">
                        <a href={`https://wa.me/${order.telefono}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-success text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-success/90 transition-colors">
                          <MessageCircle size={16} /> CLIENTE
                        </a>
                        <select 
                          value={status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="flex-1 bg-dark text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
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
          <div className="py-16 text-center bg-white border border-dashed border-border rounded-3xl">
            <Package size={32} className="mx-auto mb-3 text-muted opacity-30" />
            <p className="text-sm font-black text-muted uppercase tracking-widest">No hay pedidos en esta categoría</p>
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
    </div>
  );
}
