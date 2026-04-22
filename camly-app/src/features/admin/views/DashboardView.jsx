import { useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, 
  ArrowUpRight, ArrowDownRight, Package, Loader2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import { formatMoney } from '../../../lib/utils';
import PremiumLock from '../../../components/ui/PremiumLock';

export default function DashboardView({ orders, products }) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthStr = now.toISOString().slice(0, 7); // YYYY-MM

    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    
    // Filtrar por periodos
    const todayOrders = orders.filter(o => o.created_at?.startsWith(todayStr));
    const monthOrders = orders.filter(o => o.created_at?.startsWith(thisMonthStr));
    
    const todaySales = todayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const monthSales = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    
    const completedOrders = orders.filter(o => o.estado === 'entregado' || o.status === 'entregado');
    const totalCompletedSales = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const avgTicket = orders.length > 0 ? totalSales / orders.length : 0;
    
    // Métodos de Pago
    const paymentMethods = orders.reduce((acc, o) => {
      const { pago_metodo, total } = o;
      const key = pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
      acc[key] = (acc[key] || 0) + (total || 0);
      return acc;
    }, {});

    // Group sales by day (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dayOrders = orders.filter(o => o.created_at?.startsWith(date));
      return {
        name: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        ventas: dayOrders.reduce((acc, o) => acc + (o.total || 0), 0),
        pedidos: dayOrders.length
      };
    });

    // Top Products
    const productCounts = {};
    orders.forEach(o => {
      const items = o.items || o.productos;
      if (Array.isArray(items)) {
        items.forEach(p => {
          productCounts[p.nombre || p.name] = (productCounts[p.nombre || p.name] || 0) + (p.cantidad || p.quantity || 1);
        });
      }
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { 
      totalSales, todaySales, monthSales, 
      totalCompletedSales, avgTicket, chartData, 
      topProducts, totalOrders: orders.length,
      paymentMethods
    };
  }, [orders]);

  const cards = [
    { label: 'Ingresos Hoy', value: formatMoney(stats.todaySales), icon: ArrowUpRight, color: 'text-brand', bg: 'bg-brand/5', trend: 'Actual' },
    { label: 'Ventas del Mes', value: formatMoney(stats.monthSales), icon: TrendingUp, color: 'text-success', bg: 'bg-success/5', trend: 'Mensual' },
    { label: 'Ventas Históricas', value: formatMoney(stats.totalSales), icon: DollarSign, color: 'text-accent', bg: 'bg-accent/5', trend: 'Total' },
    { label: 'Pedidos Totales', value: stats.totalOrders, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-500/5', trend: '+5%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Stats Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white border border-border p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">
                <ArrowUpRight size={12} /> {card.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-black text-dark tracking-tighter mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Sales Chart ──────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-border p-8 rounded-[3rem] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-black text-dark uppercase tracking-tight">Rendimiento Semanal</h4>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Ventas de los últimos 7 días</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase truncate">
                  <div className="w-2 h-2 bg-brand rounded-full" /> Ingresos
               </div>
            </div>
          </div>

          <PremiumLock featureName="Métricas y Gráficos Visuales">
            <div className="w-full h-[350px] min-h-[350px] relative overflow-hidden">
              {stats.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(val) => [formatMoney(val), 'Ventas']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="var(--color-brand)" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorVentas)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted opacity-20">
                  <TrendingUp size={40} className="mb-2" />
                  <p className="text-[10px] font-black uppercase">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </PremiumLock>
        </div>

        {/* ── Additional Stats ───────────────────────────────── */}
        <div className="space-y-8">
          {/* Métodos de Pago */}
          <div className="bg-white border border-border p-8 rounded-[3rem] shadow-sm">
             <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">💰 Ingresos x Pago</h4>
             <div className="space-y-6">
                {Object.entries(stats.paymentMethods).length > 0 ? (
                  Object.entries(stats.paymentMethods).map(([method, total]) => (
                    <div key={method} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase">
                         <span className="text-muted">{method}</span>
                         <span className="text-brand">{formatMoney(total)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-brand rounded-full transition-all duration-1000" 
                           style={{ width: `${stats.totalSales > 0 ? (total / stats.totalSales) * 100 : 0}%` }}
                         />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-center text-muted font-bold uppercase py-4">Esperando pedidos...</p>
                )}
             </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border border-border p-8 rounded-[3rem] shadow-sm">
            <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">🏆 Productos Top</h4>
            <div className="space-y-5">
              {stats.topProducts.length > 0 ? (
                stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand/10 text-brand rounded-lg flex items-center justify-center text-[10px] font-black">
                        #{i + 1}
                      </div>
                      <span className="text-sm font-bold text-dark group-hover:text-brand transition-colors truncate max-w-[120px]">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-muted uppercase shrink-0">{p.count} ventas</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center opacity-30">
                  <Package size={30} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase">Sin ventas aún</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-8 py-3 border border-dashed border-border rounded-xl text-[10px] font-black text-muted uppercase tracking-widest hover:border-brand/40 hover:text-brand transition-all">
              Ver Reporte PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
