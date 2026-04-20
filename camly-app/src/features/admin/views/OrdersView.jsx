import { MessageCircle, Clock, CheckCircle2, ChevronRight, User, MapPin, Package } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import { updateOrderStatus } from '../../../lib/supabase';

export default function OrdersView({ orders, onUpdate }) {
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-border rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 flex flex-col lg:flex-row gap-6">
              {/* Header Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg-alt rounded-full flex items-center justify-center text-dark font-black text-xs">
                      #{order.id.toString().slice(-4)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] block">ID Pedido</span>
                      <span className="text-xs font-bold text-dark">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(order.estado || order.status)}`}>
                    {order.estado || order.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-bg-alt rounded-lg text-muted shrink-0"><User size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Cliente</p>
                      <p className="text-sm font-black text-dark">{order.nombre}</p>
                      <p className="text-xs font-bold text-muted">{order.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-bg-alt rounded-lg text-muted shrink-0"><MapPin size={16} /></div>
                    <div>
                      <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Dirección</p>
                      <p className="text-xs font-bold text-dark italic">{order.direccion || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List & Total */}
              <div className="lg:w-72 bg-bg-alt rounded-2xl p-5 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-brand" />
                    <p className="text-[10px] font-black text-dark uppercase tracking-widest">Resumen</p>
                  </div>
                  {/* JSON Parse fallback for products */}
                  <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-2">
                    {Array.isArray(order.productos) ? order.productos.map((p, i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-dark truncate mr-2">{p.quantity}x {p.name}</span>
                        <span className="text-muted shrink-0">{formatMoney(p.price * p.quantity)}</span>
                      </div>
                    )) : <p className="text-[10px] text-muted italic">Detalles no disponibles</p>}
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-dark uppercase tracking-widest">Total</span>
                  <span className="text-lg font-black text-brand tracking-tighter">{formatMoney(order.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row lg:flex-col gap-3">
                <a 
                  href={`https://wa.me/${order.telefono}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-success text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-success/20 hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                <div className="flex-1 lg:flex-none relative group">
                  <select 
                    value={order.estado || order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="w-full bg-dark text-white pl-4 pr-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand cursor-pointer"
                  >
                    <option value="nuevo">Marcar Nuevo</option>
                    <option value="preparando">Preparando</option>
                    <option value="enviado">En Camino</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="py-20 text-center bg-white border border-dashed border-border rounded-[2.5rem]">
            <div className="w-16 h-16 bg-bg-alt rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-muted" />
            </div>
            <h5 className="text-sm font-black text-dark uppercase tracking-widest">Sin Pedidos</h5>
            <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Todavía no has recibido pedidos en tu tienda</p>
          </div>
        )}
      </div>
    </div>
  );
}
