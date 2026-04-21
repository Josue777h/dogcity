import { useState, useEffect } from 'react';
import { 
  MessageCircle, Clock, CheckCircle2, ChevronRight, 
  User, MapPin, Package, Bike, ArrowUpRight 
} from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import { updateOrderStatus, getSupabase } from '../../../lib/supabase';

export default function OrdersView({ orders, onUpdate }) {
  const [drivers, setDrivers] = useState([]);
  const [loadingDriver, setLoadingDriver] = useState(null);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
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
    const message = `🚀 *NUEVO PEDIDO ASIGNADO*\n\n` +
      `👤 *Cliente:* ${order.nombre}\n` +
      `📞 *Tel:* ${order.telefono}\n` +
      `📍 *Dirección:* ${order.direccion || 'Ver mapa'}\n` +
      `🗺️ *Google Maps:* ${mapsLink}\n\n` +
      `💰 *Valor:* ${formatMoney(order.total)}`;

    window.open(`https://wa.me/${driver.telefono}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header List */}
      <div className="hidden lg:grid grid-cols-6 gap-4 px-8 py-4 bg-dark/5 rounded-2xl text-[10px] font-black text-muted uppercase tracking-[0.2em]">
        <span>ID / Tiempo</span>
        <span className="col-span-2">Cliente / Detalles</span>
        <span>Total</span>
        <span>Estado</span>
        <span className="text-right">Acciones</span>
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-border rounded-3xl overflow-hidden hover:border-brand/40 transition-all duration-300 shadow-sm hover:shadow-xl">
            {/* Header Row */}
            <div 
              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              className="p-4 sm:p-6 cursor-pointer flex flex-col lg:grid lg:grid-cols-6 gap-4 items-center"
            >
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="px-3 py-1.5 bg-brand text-white rounded-lg font-black text-[10px] tracking-tight">
                  #{order.id.toString().slice(-4).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-dark">{new Date(order.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="col-span-2 w-full lg:w-auto">
                <p className="text-xs font-black text-dark uppercase tracking-tight truncate">{order.nombre}</p>
                <p className="text-[10px] text-muted font-bold truncate tracking-widest uppercase">{order.entrega_metodo === 'envio' ? '🛵 Domicilio' : '🏠 Local'}</p>
              </div>

              <div className="w-full lg:w-auto">
                <span className="text-sm font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
              </div>

              <div className="w-full lg:w-auto">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-full text-center block ${getStatusColor(order.estado || order.status)}`}>
                  {order.estado || order.status}
                </span>
              </div>

              <div className="flex justify-end gap-2 w-full lg:w-auto">
                 <button className="p-2 transition-transform hover:scale-110 text-muted">
                    <ChevronRight size={18} className={`transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                 </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedOrderId === order.id && (
              <div className="px-6 pb-6 pt-2 border-t border-dashed border-border animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Summary */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">📍 Detalles de Entrega</h4>
                      <p className="text-xs font-bold text-dark flex items-center gap-2"><User size={14}/> {order.nombre} - <span className="text-brand">{order.telefono}</span></p>
                      <p className="text-xs text-muted font-medium mt-2 flex items-start gap-2 italic"><MapPin size={14}/> {order.direccion || 'Recogida en local'}</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">🛵 Gestión de Envío</h4>
                      <div className="flex gap-2">
                        <select 
                          disabled={loadingDriver === order.id}
                          value={order.domiciliario_id || ''}
                          onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                          className="flex-1 bg-bg-alt border border-border px-4 py-2.5 rounded-xl text-[10px] font-black text-dark outline-none"
                        >
                          <option value="">Sin asignar</option>
                          {drivers.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                        </select>
                        {order.domiciliario_id && (
                          <button onClick={() => handleDispatch(order)} className="px-4 py-2 bg-dark text-white rounded-xl text-[9px] font-black uppercase">Despachar</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="bg-bg-alt/50 rounded-2xl p-6">
                    <h4 className="text-[10px] font-black text-dark uppercase tracking-[0.2em] mb-4">🛒 Productos</h4>
                    <div className="space-y-2">
                      {order.productos?.map((p, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-dark">{p.quantity}x {p.name}</span>
                          <span className="font-black text-muted opacity-60 text-[10px]">{formatMoney(p.price * p.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                       <span className="text-[10px] font-black text-muted uppercase tracking-widest">Total Orden</span>
                       <span className="text-lg font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
                    </div>

                    <div className="mt-6 flex gap-2">
                       <a href={`https://wa.me/${order.telefono}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-success text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          <MessageCircle size={14} /> Cliente
                       </a>
                       <select 
                        value={order.estado || order.status}
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
        ))}
      </div>
    </div>
  );
}
