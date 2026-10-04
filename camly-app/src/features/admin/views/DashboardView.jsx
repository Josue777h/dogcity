import { useMemo } from 'react';
import {
  TrendingUp, ShoppingBag, DollarSign,
  ArrowUpRight, ArrowDownRight, Package, PackagePlus, Trophy,
  Settings, ExternalLink, Share2, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { formatMoney, getGreeting, useAnimatedCounter } from '../../../lib/utils';
import PremiumLock from '../../../components/ui/PremiumLock';

function StatCard({ label, value, rawValue, isMoney, icon: Icon, trend, trendPositive, sparkData }) {
  const animated = useAnimatedCounter(rawValue ?? 0, 1000);
  const display  = isMoney ? formatMoney(animated) : animated;

  return (
    <div className="card p-4 sm:p-5 bg-white border-gray-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Icon size={16} strokeWidth={2} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight tabular-nums truncate">
          {display}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
        {trend !== undefined && (
          <span className={`font-semibold flex items-center gap-1 ${trendPositive ? 'text-emerald-600' : 'text-gray-500'}`}>
            {trendPositive && <ArrowUpRight size={13} />}
            <span>{trend}</span>
          </span>
        )}
      </div>

      {sparkData && sparkData.some(v => v > 0) && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData.map((v, i) => ({ v, i }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#EA580C"
                strokeWidth={1.5}
                fill="#EA580C"
                fillOpacity={0.1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function DashboardView({ orders, products, business, onNavigate }) {
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr     = now.toISOString().split('T')[0];
    const thisMonthStr = now.toISOString().slice(0, 7);

    const totalSales  = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const todayOrders = orders.filter(o => o.created_at?.startsWith(todayStr));
    const monthOrders = orders.filter(o => o.created_at?.startsWith(thisMonthStr));
    const todaySales  = todayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const monthSales  = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
      const dayOrders = orders.filter(o => o.created_at?.startsWith(date));
      return {
        name: new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
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

    const sparkSales = last7Days.map(date =>
      orders.filter(o => o.created_at?.startsWith(date)).reduce((acc, o) => acc + (o.total || 0), 0)
    );

    return { totalSales, todaySales, monthSales, todayOrders, monthOrders, chartData, topProducts, sparkSales };
  }, [orders]);

  const greeting = getGreeting();
  const pendingOrders = orders.filter(o => ['nuevo', 'new', 'pending'].includes((o.status || o.estado)?.toLowerCase()));

  const completedConfigTasks = [
    Boolean(business?.nombre_visible),
    Boolean(business?.telefono || business?.whatsapp_contacto),
    products.length > 0,
    orders.length > 0
  ];
  const configPercent = Math.round((completedConfigTasks.filter(Boolean).length / completedConfigTasks.length) * 100);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {greeting}, {business?.nombre_visible?.split(' ')[0] || 'equipo'} 👋
          </h2>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            Aquí tienes el resumen operativo y comercial de tu negocio en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('products')}
            className="btn-primary py-2.5 px-3.5 text-xs font-semibold flex-1 sm:flex-initial justify-center"
          >
            <PackagePlus size={15} />
            <span>Nuevo producto</span>
          </button>
          <a
            href={`/${business?.nombre || ''}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary py-2.5 px-3 text-xs font-semibold flex-1 sm:flex-initial justify-center"
          >
            <span>Ver mi tienda</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Pending orders alert */}
      {pendingOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 border-l-4 border-l-amber-500 flex items-center justify-between gap-4 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShoppingBag size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                Tienes {pendingOrders.length} pedido{pendingOrders.length > 1 ? 's' : ''} pendiente{pendingOrders.length > 1 ? 's' : ''} de confirmación
              </p>
              <p className="text-[11px] text-amber-700">Atiéndelos rápido para mejorar la experiencia de tus clientes.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="btn-secondary py-1.5 px-3 text-xs font-bold text-amber-900 border-amber-300 hover:bg-amber-100 shrink-0"
          >
            Ver pedidos
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label="Ventas de hoy"
          rawValue={stats.todaySales}
          isMoney
          icon={DollarSign}
          trend={`${stats.todayOrders.length} pedidos hoy`}
          trendPositive={stats.todayOrders.length > 0}
          sparkData={stats.sparkSales}
        />
        <StatCard
          label="Ventas del mes"
          rawValue={stats.monthSales}
          isMoney
          icon={TrendingUp}
          trend={`${stats.monthOrders.length} pedidos este mes`}
          trendPositive={stats.monthOrders.length > 0}
        />
        <StatCard
          label="Total acumulado"
          rawValue={stats.totalSales}
          isMoney
          icon={DollarSign}
          trend={`${orders.length} pedidos totales`}
          trendPositive={orders.length > 0}
        />
        <StatCard
          label="Catálogo activo"
          rawValue={products.filter(p => p.disponible).length}
          icon={Package}
          trend={`${products.length} productos registrados`}
          trendPositive
        />
      </div>

      {/* Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sales Chart (8 Cols) */}
        <div className="lg:col-span-8 card p-5 bg-white border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Tendencia de ventas — últimos 7 días
              </h3>
              <p className="text-[11px] text-gray-500">Volumen diario facturado a través de tu tienda</p>
            </div>
            <span className="badge badge-neutral text-[10px]">Semanal</span>
          </div>

          <PremiumLock featureName="Gráfico de Ventas Avanzado">
            {stats.chartData.some(d => d.ventas > 0) ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -15 }}>
                    <defs>
                      <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={v => [formatMoney(v), 'Ventas']}
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="#EA580C"
                      strokeWidth={2.5}
                      fill="url(#gradVentas)"
                      dot={{ r: 3, fill: '#EA580C' }}
                      activeDot={{ r: 5, fill: '#C2410C' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                <TrendingUp size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-700">Aún no hay ventas en los últimos 7 días</p>
                <p className="text-[11px] text-gray-400 max-w-xs mt-0.5">
                  Comparte el link de tu tienda en redes sociales y WhatsApp para empezar a registrar ventas.
                </p>
              </div>
            )}
          </PremiumLock>
        </div>

        {/* Top Selling Products (4 Cols) */}
        <div className="lg:col-span-4 card p-5 bg-white border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-orange-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Más vendidos
                </h3>
              </div>
            </div>

            {stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{i + 1}
                      </span>
                      <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                    </div>
                    <span className="text-gray-500 font-bold tabular-nums shrink-0">{p.count} uds</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                <PackagePlus size={28} className="opacity-40 mx-auto mb-2" />
                <p className="font-medium text-gray-500">Sin datos de ventas aún</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Aparecerán cuando despaches pedidos</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 mt-4">
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center justify-between w-full"
            >
              <span>Gestionar todos los productos</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pedidos en vivo', tab: 'orders', icon: ShoppingBag, desc: 'Atiende clientes' },
          { label: 'Catálogo de menú', tab: 'products', icon: Package, desc: 'Precios e imágenes' },
          { label: 'Reporte de ventas', tab: 'revenue', icon: DollarSign, desc: 'Historial e ingresos' },
          { label: 'Configuración', tab: 'settings', icon: Settings, desc: 'Horarios y marca' },
        ].map(a => (
          <button
            key={a.tab}
            onClick={() => onNavigate(a.tab)}
            className="card p-4 bg-white border-gray-200/80 hover:border-orange-300 hover:shadow-xs transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors flex items-center justify-center mb-2.5">
              <a.icon size={17} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {a.label}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

    </div>
  );
}
