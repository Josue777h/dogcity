import { useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, DollarSign, 
  ArrowUpRight, Package, Plus, PackagePlus
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { formatMoney, getGreeting, useAnimatedCounter } from '../../../lib/utils';
import PremiumLock from '../../../components/ui/PremiumLock';

function StatCard({ label, value, rawValue, isMoney, icon: Icon, color, bg, trend, sparkData }) {
  const animated = useAnimatedCounter(rawValue ?? 0, 1200);
  const display = isMoney ? formatMoney(animated) : animated;

  return (
    <div className="card-3d bg-white border border-border p-6 rounded-[2.5rem] shadow-sm group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
          <Icon size={24} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">
          <ArrowUpRight size={12} /> {trend}
        </div>
      </div>
      {sparkData && (
        <div className="mb-3 h-8 flex items-end gap-0.5">
          {sparkData.map((v, i) => (
            <div key={i} className="flex-1 bg-brand/20 rounded-sm group-hover:bg-brand/40 transition-colors" style={{ height: `${Math.max(15, (v / Math.max(...sparkData)) * 100)}%` }} />
          ))}
        </div>
      )}
      <p className="text-[10px] font-black text-muted uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-dark tracking-tighter mt-1">{display}</h3>
    </div>
  );
}

export default function DashboardView({ orders, products, business, onNavigate }) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthStr = now.toISOString().slice(0, 7);

    const totalSales = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const todayOrders = orders.filter(o => o.created_at?.startsWith(todayStr));
    const monthOrders = orders.filter(o => o.created_at?.startsWith(thisMonthStr));
    const todaySales = todayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const monthSales = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);

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

    const paymentMethods = orders.reduce((acc, o) => {
      const key = o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo';
      acc[key] = (acc[key] || 0) + (o.total || 0);
      return acc;
    }, {});

    const sparkData = chartData.map(d => d.ventas);

    return { 
      totalSales, todaySales, monthSales, chartData, 
      topProducts, totalOrders: orders.length,
      paymentMethods, sparkData
    };
  }, [orders]);

  const greeting = getGreeting();
  const name = business?.nombre_visible?.split(' ')[0] || 'Admin';

  const cards = [
    { label: 'Ingresos Hoy', rawValue: stats.todaySales, isMoney: true, icon: ArrowUpRight, color: 'text-brand', bg: 'bg-brand/5', trend: 'Actual' },
    { label: 'Ventas del Mes', rawValue: stats.monthSales, isMoney: true, icon: TrendingUp, color: 'text-success', bg: 'bg-success/5', trend: 'Mensual' },
    { label: 'Ventas Históricas', rawValue: stats.totalSales, isMoney: true, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/5', trend: 'Total' },
    { label: 'Pedidos Totales', rawValue: stats.totalOrders, isMoney: false, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-500/5', trend: 'Total' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Greeting + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-dark tracking-tighter uppercase">
            {greeting}, <span className="text-brand">{name}</span>
          </h2>
          <p className="text-sm text-muted font-medium mt-1">Aquí tienes el resumen de tu negocio hoy.</p>
        </div>
        {onNavigate && (
          <div className="flex gap-2">
            <button onClick={() => onNavigate('orders')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-dark hover:border-brand/40 hover:text-brand transition-all shadow-sm">
              <Plus size={14} /> Nuevo Pedido
            </button>
            <button onClick={() => onNavigate('products')} className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
              <PackagePlus size={14} /> Nuevo Producto
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} sparkData={stats.sparkData} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-border p-8 rounded-[3rem] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-black text-dark uppercase tracking-tight">Rendimiento Semanal</h4>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Ventas de los últimos 7 días</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-brand uppercase">
                <div className="w-2 h-2 bg-brand rounded-full animate-pulse" /> Ingresos
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
                        <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.25}/>
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
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(37,99,235,0.15)', fontSize: '12px', fontWeight: 'bold', padding: '12px 16px' }}
                      formatter={(val) => [formatMoney(val), 'Ventas']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="var(--color-brand)" 
                      strokeWidth={3}
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

        {/* Side panels */}
        <div className="space-y-8">
          <div className="bg-white border border-border p-8 rounded-[3rem] shadow-sm">
            <h4 className="text-xs font-black text-muted uppercase tracking-[0.2em] mb-6">Ingresos por Tipo de Pago</h4>
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
                        className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all duration-1000" 
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
          </div>
        </div>
      </div>
    </div>
  );
}
