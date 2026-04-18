import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Plus, 
  Trash2, Edit, Save, X, Loader2, CheckCircle2, Clock, Truck, 
  AlertCircle, ChevronRight, Store, Search, Filter, ArrowUpRight,
  TrendingUp, Users, DollarSign
} from 'lucide-react';
import { getSupabase, signIn, fetchProducts, createProduct, updateProduct, deleteProduct, fetchOrders, updateOrderStatus, subscribeToOrders, uploadImage } from '../../lib/supabase';
import { useAuthStore, useToastStore, useBusinessStore } from '../../stores';
import { formatMoney } from '../../lib/utils';

const TABS = [
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'products', label: 'Catálogo', icon: Package },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export default function AdminPage() {
  const { session, setSession } = useAuthStore();
  const { business, setBusiness } = useBusinessStore();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState('orders');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session: s } } = await getSupabase().auth.getSession();
      setSession(s);
      if (s) loadData(s.user.id);
    }
    checkAuth();
  }, []);

  async function loadData(userId) {
    setLoading(true);
    try {
      const { data: biz } = await getSupabase().from('negocios').select('*').eq('user_id', userId).single();
      setBusiness(biz);
      if (biz) {
        const [p, o] = await Promise.all([fetchProducts(biz.id), fetchOrders(biz.id)]);
        setProducts(p);
        setOrders(o);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Auth handler
  async function handleLogin(e) {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const s = await signIn(email, password);
      setSession(s);
      loadData(s.user.id);
      addToast('Bienvenido de nuevo', 'success');
    } catch (err) {
      addToast('Credenciales inválidas', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-bg-alt to-bg-alt">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand/30 mb-4 animate-bounce">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tighter uppercase italic">CAMLY <span className="text-brand">ADMIN</span></h1>
            <p className="text-sm text-muted font-bold tracking-widest uppercase mt-1">Panel de Control SaaS</p>
          </div>

          <div className="premium-card !p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Email Corporativo</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@tuapp.com" 
                  className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Contraseña</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-bg-alt border border-border rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all outline-none font-bold text-sm"
                  required 
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoggingIn} 
                className="w-full btn-primary !py-4 shadow-xl shadow-brand/20 disabled:opacity-50"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <div className="flex items-center gap-2">ENTRAR AL PANEL <ChevronRight size={18} /></div>}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] font-black text-muted uppercase tracking-widest">
              <a href="/registro" className="hover:text-brand transition-colors">Crear Cuenta</a>
              <span>Seguridad SSL 256bits</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt flex">
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside className="fixed lg:static inset-y-0 left-0 w-72 bg-dark text-white z-[100] flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/50">
              <Store size={22} />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-lg font-black tracking-tighter truncate uppercase leading-none">{business?.nombre_visible || 'PANEL'}</h2>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Dashboard Pro</span>
            </div>
          </div>

          <nav className="space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all
                  ${activeTab === tab.id ? 'bg-brand text-white shadow-xl shadow-brand/30 translate-x-1' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={() => { getSupabase().auth.signOut(); setSession(null); }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-error/60 hover:bg-error/10 hover:text-error transition-all"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-border sticky top-0 z-[80] px-8 py-5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-dark uppercase tracking-tight">
                {TABS.find(t => t.id === activeTab)?.label}
              </h3>
              <div className="h-6 w-px bg-border hidden sm:block"></div>
              <p className="text-xs text-muted font-bold hidden sm:block">Gestionando {business?.nombre_visible}</p>
           </div>
           
           <div className="flex items-center gap-4">
              <a href={`/s/${business?.nombre}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-xl text-xs font-black transition-all hover:bg-brand hover:text-white group">
                VER TIENDA <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
           </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
          {/* Stats Summary */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { label: 'Pedidos Hoy', value: orders.filter(o => o.created_at?.includes(new Date().toISOString().split('T')[0])).length, icon: ShoppingBag, color: 'brand' },
                 { label: 'Ingresos Totales', value: formatMoney(orders.reduce((s,o) => s + (o.total || 0), 0)), icon: TrendingUp, color: 'success' },
                 { label: 'Ticket Promedio', value: formatMoney(orders.length ? orders.reduce((s,o) => s + (o.total || 0), 0) / orders.length : 0), icon: DollarSign, color: 'accent' },
                 { label: 'Catálogo', value: products.length, icon: Package, color: 'dark' }
               ].map((stat, i) => (
                 <div key={i} className="premium-card !p-6 flex items-center gap-5">
                    <div className={`p-4 bg-${stat.color}/10 text-${stat.color} rounded-2xl`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</p>
                      <p className="text-xl font-black text-dark">{stat.value}</p>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {/* Table / Grid Content */}
          <div className="premium-card !p-0 overflow-hidden min-h-[600px] bg-white">
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-bg-alt border-b border-border">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">ID / Fecha</th>
                        <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">Cliente</th>
                        <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap">Total</th>
                        <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap text-center">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-black text-muted uppercase tracking-widest whitespace-nowrap text-right">Acciones</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border font-medium">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-bg-alt/50 transition-colors">
                           <td className="px-6 py-4">
                              <span className="text-sm font-bold text-dark truncate block max-w-[100px]">#{order.id.toString().slice(-6)}</span>
                              <span className="text-[10px] text-muted block italic">{new Date(order.created_at).toLocaleTimeString()}</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-sm font-bold text-dark block">{order.nombre}</span>
                              <span className="text-[10px] text-muted font-bold">{order.telefono}</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-sm font-black text-brand">{formatMoney(order.total)}</span>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <select 
                                  value={order.estado || order.status} 
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value).then(() => loadData(session.user.id))}
                                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-brand/20 outline-none
                                    ${(order.estado === 'nuevo') ? 'bg-brand/5 border-brand text-brand' : ''}
                                    ${(order.estado === 'preparando') ? 'bg-warning/5 border-warning text-warning' : ''}
                                    ${(order.estado === 'enviado') ? 'bg-accent/5 border-accent text-accent' : ''}
                                    ${(order.estado === 'entregado') ? 'bg-success/5 border-success text-success' : ''}`}
                                >
                                  <option value="nuevo">Nuevo</option>
                                  <option value="preparando">Preparando</option>
                                  <option value="enviado">En Camino</option>
                                  <option value="entregado">Entregado</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <a 
                                href={`https://wa.me/${order.telefono}`}
                                target="_blank" rel="noreferrer"
                                className="p-2.5 bg-success/10 text-success rounded-xl hover:bg-success hover:text-white transition-colors inline-block"
                              >
                                <MessageCircle size={18} />
                              </a>
                           </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-20 text-center text-muted font-bold italic uppercase tracking-widest">Aún no hay pedidos registrados</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="p-8">
                 <div className="flex justify-between items-center mb-10">
                    <div className="relative w-full max-w-sm">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                       <input type="text" placeholder="Filtrar por nombre o categoría..." className="w-full pl-10 pr-4 py-2.5 bg-bg-alt border border-border rounded-xl text-sm font-bold outline-none focus:border-brand" />
                    </div>
                    <button onClick={() => setEditingProduct({})} className="btn-primary !py-2.5 !px-5 text-sm">
                      <Plus size={18} /> NUEVO PRODUCTO
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map(p => (
                      <div key={p.id} className="premium-card p-4 group">
                         <div className="flex gap-4">
                            <div className="w-20 h-20 bg-bg-alt rounded-2xl overflow-hidden relative">
                               <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => setEditingProduct(p)} className="p-2 bg-white text-dark rounded-full shadow-lg"><Edit size={14}/></button>
                               </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <span className="text-[10px] font-black text-muted uppercase tracking-widest leading-none block">{p.categoria || 'Sin Cat'}</span>
                               <h4 className="text-sm font-black text-dark truncate my-1">{p.name}</h4>
                               <p className="text-lg font-black text-brand tracking-tighter">{formatMoney(p.price)}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                               <button onClick={() => deleteProduct(p.id).then(() => loadData(session.user.id))} className="p-2 text-muted hover:text-error transition-colors hover:bg-error/10 rounded-xl"><Trash2 size={16} /></button>
                               <div className={`w-2.5 h-2.5 rounded-full ${p.disponible ? 'bg-success' : 'bg-error'} animate-pulse ml-auto`} title={p.disponible ? 'Disponible' : 'Agotado'} />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-8 max-w-2xl">
                 <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">⚙️ Detalle del Negocio</h4>
                 <div className="grid gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Comercial</label>
                       <input type="text" defaultValue={business?.nombre_visible} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold shadow-inner" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Slug (URL)</label>
                       <input type="text" defaultValue={business?.nombre} disabled className="w-full p-4 bg-border/50 border border-border rounded-xl font-bold opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">WhatsApp de Pedidos</label>
                       <input type="tel" defaultValue={business?.telefono} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold" />
                    </div>
                    <button className="btn-primary !py-4 shadow-xl shadow-brand/20 mt-4">
                      GUARDAR CAMBIOS <Save size={18} />
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODALS ────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-dark/80 backdrop-blur-md" onClick={() => setEditingProduct(null)} />
           <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-brand p-8 text-white">
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase">Gestionar Producto</h3>
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Completa los detalles para actualizar el catálogo</p>
                 <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={28} /></button>
              </div>
              <div className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-muted uppercase tracking-widest">Nombre</label>
                       <input type="text" autoFocus value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-3 bg-bg-alt border border-border rounded-xl font-bold text-sm outline-none focus:border-brand" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-muted uppercase tracking-widest">Precio</label>
                       <input type="number" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full p-3 bg-brand/5 border border-brand/20 rounded-xl font-black text-brand text-sm outline-none focus:bg-brand/10" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Categoría</label>
                    <input type="text" placeholder="Ej: Perros, Hamburguesas..." value={editingProduct.categoria || ''} onChange={e => setEditingProduct({...editingProduct, categoria: e.target.value})} className="w-full p-3 bg-bg-alt border border-border rounded-xl font-bold text-sm outline-none focus:border-brand" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest">Descripción</label>
                    <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-3 bg-bg-alt border border-border rounded-xl font-medium text-xs outline-none focus:border-brand min-h-[80px]" placeholder="Ingredientes, tamaño..." />
                 </div>
                 
                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        const action = editingProduct.id ? () => updateProduct(editingProduct.id, editingProduct) : () => createProduct({...editingProduct, negocio_id: business.id});
                        action().then(() => { addToast('Catálogo actualizado', 'success'); setEditingProduct(null); loadData(session.user.id); });
                      }}
                      className="flex-1 btn-primary !py-4 shadow-xl shadow-brand/20"
                    >
                      <Save size={18} /> GUARDAR PRODUCTO
                    </button>
                    <button onClick={() => setEditingProduct(null)} className="px-6 border-2 border-border text-muted rounded-xl hover:bg-bg-alt transition-colors font-black text-xs">CANCELAR</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
