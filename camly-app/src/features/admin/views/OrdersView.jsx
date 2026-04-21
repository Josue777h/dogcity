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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
              
              {/* Left Section: Core Info */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-bg-alt rounded-2xl flex items-center justify-center text-dark font-black text-xs">
                      #{order.id.toString().slice(-4)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">Pedido Realizado</span>
                      <span className="text-xs font-bold text-dark">{new Date(order.created_at).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(order.estado || order.status)}`}>
                    {order.estado || order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-bg-alt rounded-2xl text-muted shrink-0"><User size={20} /></div>
                    <div>
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Datos Cliente</p>
                      <p className="text-sm font-black text-dark">{order.nombre}</p>
                      <p className="text-xs font-bold text-brand">{order.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-bg-alt rounded-2xl text-muted shrink-0"><MapPin size={20} /></div>
                    <div>
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Lugar de Entrega</p>
                      <p className="text-xs font-bold text-dark italic leading-relaxed">{order.direccion || 'Sin dirección registrada'}</p>
                    </div>
                  </div>
                </div>

                {/* Driver Assignment UI */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Bike size={12} /> Asignación de Repartidor
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                       <select 
                        disabled={loadingDriver === order.id}
                        value={order.domiciliario_id || ''}
                        onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                        className="w-full bg-bg-alt border border-border px-4 py-3 rounded-xl text-xs font-bold text-dark outline-none focus:border-brand appearance-none"
                       >
                          <option value="">Sin asignar</option>
                          {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.nombre} ({d.telefono})</option>
                          ))}
                       </select>
                       <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-muted pointer-events-none" />
                    </div>
                    {order.domiciliario_id && (
                      <button 
                        onClick={() => handleDispatch(order)}
                        className="btn-primary !bg-dark !py-3 !px-6 !text-[10px] !tracking-widest flex items-center gap-2 shadow-xl shadow-dark/20"
                      >
                        DESPACHAR <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section: Summary & Actions */}
              <div className="lg:w-80 space-y-4">
                 <div className="bg-bg-alt rounded-[2rem] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Package size={16} className="text-brand" />
                          <h6 className="text-[10px] font-black text-dark uppercase tracking-widest">Resumen Pedido</h6>
                       </div>
                       <span className="text-[10px] font-black text-muted">Total</span>
                    </div>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                       {Array.isArray(order.productos) && order.productos.map((p, i) => (
                         <div key={i} className="flex justify-between items-start gap-4">
                            <span className="text-xs font-bold text-dark leading-tight">{p.quantity}x {p.name}</span>
                            <span className="text-xs font-black text-muted whitespace-nowrap">{formatMoney(p.price * p.quantity)}</span>
                         </div>
                       ))}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between">
                       <span className="text-xl font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                          <span className="text-[9px] font-black text-muted uppercase tracking-[0.2em]">Pagado</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                   <a 
                    href={`https://wa.me/${order.telefono}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-success text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-success/20 hover:scale-[1.02] transition-transform"
                   >
                     <MessageCircle size={18} /> Cliente
                   </a>
                   <div className="relative group">
                     <select 
                      value={order.estado || order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full bg-dark text-white pl-4 pr-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand cursor-pointer"
                     >
                       <option value="nuevo">Nuevo</option>
                       <option value="preparando">Preparando</option>
                       <option value="enviado">Enviado</option>
                       <option value="entregado">Entregado</option>
                       <option value="cancelado">Cancelado</option>
                     </select>
                     <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                   </div>
                 </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
