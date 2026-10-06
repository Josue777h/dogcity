import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
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
    <div className="card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Icon size={14} strokeWidth={2} />
          </div>
        </div>
        <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 tracking-tight tabular-nums truncate">
          {display}
        </p>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
        {trend !== undefined && (
          <span className={`font-semibold flex items-center gap-1 ${trendPositive ? 'text-emerald-600' : 'text-gray-500'}`}>
            {trendPositive && <ArrowUpRight size={12} />}
            <span className="truncate">{trend}</span>
          </span>
        )}
      </div>

      {sparkData && sparkData.some(v => v > 0) && (
        <div className="mt-1.5 h-6 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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

export default function DashboardView(props) {
  const outletCtx = useOutletContext() || {};
  const navigate = useNavigate();

  const orders = props.orders ?? outletCtx.orders ?? [];
  const products = props.products ?? outletCtx.products ?? [];
  const business = props.business ?? outletCtx.business ?? null;

  const handleNavigate = (target) => {
    if (props.onNavigate) {
      props.onNavigate(target);
      return;
    }
    const tabMap = {
      dashboard: '/admin/dashboard',
      orders: '/admin/pedidos',
      pedidos: '/admin/pedidos',
      products: '/admin/productos',
      productos: '/admin/productos',
      categories: '/admin/categorias',
      categorias: '/admin/categorias',
      drivers: '/admin/domiciliarios',
      domiciliarios: '/admin/domiciliarios',
      settings: '/admin/configuracion',
      configuracion: '/admin/configuracion',
      revenue: '/admin/ingresos',
      ingresos: '/admin/ingresos',
    };
    navigate(tabMap[target] || `/admin/${target}`);
  };

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
    <div className="space-y-4 animate-fade-in-up">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/80 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
            {greeting}, {business?.nombre_visible?.split(' ')[0] || 'Administrador'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Resumen operativo y comercial de tu negocio en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => handleNavigate('products')}
            className="btn-primary py-2 px-3 text-xs font-semibold flex-1 sm:flex-initial justify-center shadow-2xs"
          >
            <PackagePlus size={14} />
            <span>Nuevo producto</span>
          </button>
          <a
            href={`/${business?.nombre || ''}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary py-2 px-3 text-xs font-semibold flex-1 sm:flex-initial justify-center shadow-2xs"
          >
            <span>Ver tienda</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Pending orders alert */}
      {pendingOrders.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 border-l-4 border-l-amber-500 flex items-center justify-between gap-3 animate-fade-in-down">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShoppingBag size={14} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Tienes {pendingOrders.length} pedido{pendingOrders.length > 1 ? 's' : ''} pendiente{pendingOrders.length > 1 ? 's' : ''} de confirmación
              </p>
              <p className="text-[10px] text-amber-700">Atiéndelos rápido para mejorar la experiencia de tus clientes.</p>
            </div>
          </div>
          <button
            onClick={() => handleNavigate('orders')}
            className="btn-secondary py-1 px-2.5 text-xs font-bold text-amber-900 border-amber-300 hover:bg-amber-100 shrink-0"
          >
            Ver pedidos
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        
        {/* Sales Chart (8 Cols) */}
        <div className="lg:col-span-8 card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                Tendencia de ventas — últimos 7 días
              </h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500">Volumen diario facturado a través de tu tienda</p>
            </div>
            <span className="badge badge-neutral text-[10px]">Semanal</span>
          </div>

          <PremiumLock featureName="Gráfico de Ventas Avanzado">
            {stats.chartData.some(d => d.ventas > 0) ? (
              <div className="h-44 sm:h-48 min-w-0 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={stats.chartData} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                    <defs>
                      <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      tick={{ fontSize: 10, fill: '#6B7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={v => [formatMoney(v), 'Ventas']}
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        fontSize: '11px',
                        padding: '6px 10px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="#EA580C"
                      strokeWidth={2}
                      fill="url(#gradVentas)"
                      dot={{ r: 2.5, fill: '#EA580C' }}
                      activeDot={{ r: 4.5, fill: '#C2410C' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 sm:h-48 flex flex-col items-center justify-center text-center p-4 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                <TrendingUp size={26} className="text-gray-300 mb-1.5" />
                <p className="text-xs font-bold text-gray-700">Aún no hay ventas en los últimos 7 días</p>
                <p className="text-[10px] sm:text-[11px] text-gray-400 max-w-xs mt-0.5">
                  Comparte el link de tu tienda en redes sociales y WhatsApp para empezar a registrar ventas.
                </p>
              </div>
            )}
          </PremiumLock>
        </div>

        {/* Top Selling Products (4 Cols) */}
        <div className="lg:col-span-4 card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-orange-600" />
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Más vendidos
                </h3>
              </div>
            </div>

            {stats.topProducts.length > 0 ? (
              <div className="space-y-2">
                {stats.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{i + 1}
                      </span>
                      <span className="font-semibold text-gray-800 truncate text-[11px] sm:text-xs">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0 tabular-nums ml-2 text-[11px] sm:text-xs">{p.count} uds</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">
                <PackagePlus size={24} className="opacity-40 mx-auto mb-1.5" />
                <p className="font-medium text-gray-500 text-xs">Sin datos de ventas aún</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Aparecerán cuando despaches pedidos</p>
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-gray-100 mt-2.5">
            <button
              onClick={() => handleNavigate('products')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center justify-between w-full cursor-pointer py-1"
            >
              <span>Gestionar todos los productos</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { label: 'Pedidos en vivo', tab: 'orders', icon: ShoppingBag, desc: 'Atiende clientes' },
          { label: 'Catálogo de menú', tab: 'products', icon: Package, desc: 'Precios e imágenes' },
          { label: 'Reporte de ventas', tab: 'revenue', icon: DollarSign, desc: 'Historial e ingresos' },
          { label: 'Configuración', tab: 'settings', icon: Settings, desc: 'Horarios y marca' },
        ].map(a => (
          <button
            key={a.tab}
            onClick={() => handleNavigate(a.tab)}
            className="card p-3 sm:p-3.5 bg-white border-gray-200/80 hover:border-orange-400 hover:shadow-xs transition-all text-left group cursor-pointer active:scale-[0.98]"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors flex items-center justify-center mb-2">
              <a.icon size={15} />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {a.label}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

    </div>
  );
}
