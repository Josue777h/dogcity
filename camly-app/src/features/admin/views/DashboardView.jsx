import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, DollarSign,
  ArrowUpRight, Package, PackagePlus, Trophy,
  Settings, ExternalLink, ChevronRight
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { formatMoney, getGreeting, useAnimatedCounter } from '../../../lib/utils';
import PremiumLock from '../../../components/ui/PremiumLock';

function StatCard({ label, rawValue, isMoney, icon: Icon, trend, trendPositive, sparkData }) {
  const animated = useAnimatedCounter(rawValue ?? 0, 1000);
  const display  = isMoney ? formatMoney(animated) : animated;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 truncate">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <Icon size={17} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-slate-950 tracking-tight tabular-nums truncate">
        {display}
      </p>
      {trend !== undefined && (
        <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${trendPositive ? 'text-emerald-700' : 'text-slate-500'}`}>
          {trendPositive && <ArrowUpRight size={13} aria-hidden="true" />}
          <span className="truncate">{trend}</span>
        </p>
      )}
      {sparkData && sparkData.some(v => v > 0) && (
        <div className="mt-2 h-8 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={sparkData.map((v, i) => ({ v, i }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke="var(--color-brand)" strokeWidth={1.5} fill="var(--color-brand)" fillOpacity={0.1} dot={false} />
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
    const dateKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const orderDateKey = (order) => {
      if (!order.created_at) return '';
      const date = new Date(order.created_at);
      return Number.isNaN(date.getTime()) ? '' : dateKey(date);
    };
    const todayStr = dateKey(now);
    const thisMonthStr = todayStr.slice(0, 7);

    const totalSales  = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const todayOrders = orders.filter(o => orderDateKey(o) === todayStr);
    const monthOrders = orders.filter(o => orderDateKey(o).startsWith(thisMonthStr));
    const todaySales  = todayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const monthSales  = monthOrders.reduce((acc, o) => acc + (o.total || 0), 0);

    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const weekDates = [...Array(7)].map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return dateKey(date);
    });

    const chartData = weekDates.map(date => {
      const dayOrders = orders.filter(o => orderDateKey(o) === date);
      return {
        name: new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
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

    const sparkSales = weekDates.map(date =>
      orders.filter(o => orderDateKey(o) === date).reduce((acc, o) => acc + (o.total || 0), 0)
    );

    return { totalSales, todaySales, monthSales, todayOrders, monthOrders, chartData, topProducts, sparkSales };
  }, [orders]);

  const greeting = getGreeting();
  const pendingOrders = orders.filter(o => ['nuevo', 'new', 'pending'].includes((o.status || o.estado)?.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-in-up">

      <div className="admin-page-head !mb-0">
        <div className="min-w-0">
          <h2 className="admin-page-title">
            {greeting}, {business?.nombre_visible?.split(' ')[0] || 'Administrador'}
          </h2>
          <p className="admin-page-sub">Resumen operativo y comercial de tu negocio en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => handleNavigate('products')} className="btn-primary flex-1 sm:flex-initial">
            <PackagePlus size={16} aria-hidden="true" />
            <span>Nuevo producto</span>
          </button>
          <a href={`/${business?.nombre || ''}`} target="_blank" rel="noreferrer" className="btn-secondary flex-1 sm:flex-initial">
            <span>Ver tienda</span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      {pendingOrders.length > 0 && (
        <div role="status" className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-down">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <ShoppingBag size={17} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-950">
                Tienes {pendingOrders.length} pedido{pendingOrders.length > 1 ? 's' : ''} pendiente{pendingOrders.length > 1 ? 's' : ''} de confirmación
              </p>
              <p className="text-xs text-amber-800">Atiéndelos rápido para mejorar la experiencia de tus clientes.</p>
            </div>
          </div>
          <button onClick={() => handleNavigate('orders')} className="btn-secondary border-amber-300 text-amber-950 hover:!bg-amber-100 shrink-0 w-full sm:w-auto">
            Ver pedidos
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Ventas de hoy" rawValue={stats.todaySales} isMoney icon={DollarSign}
          trend={`${stats.todayOrders.length} pedidos hoy`} trendPositive={stats.todayOrders.length > 0} sparkData={stats.sparkSales} />
        <StatCard label="Ventas del mes" rawValue={stats.monthSales} isMoney icon={TrendingUp}
          trend={`${stats.monthOrders.length} pedidos este mes`} trendPositive={stats.monthOrders.length > 0} />
        <StatCard label="Total acumulado" rawValue={stats.totalSales} isMoney icon={DollarSign}
          trend={`${orders.length} pedidos totales`} trendPositive={orders.length > 0} />
        <StatCard label="Catálogo activo" rawValue={products.filter(p => p.disponible).length} icon={Package}
          trend={`${products.length} productos registrados`} trendPositive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm min-w-0">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Tendencia de ventas</h3>
              <p className="text-xs text-slate-500 mt-0.5">Lunes a domingo · volumen diario facturado</p>
            </div>
            <span className="badge badge-neutral">Semanal</span>
          </div>

          <PremiumLock featureName="Gráfico de Ventas Avanzado">
            {stats.chartData.some(d => d.ventas > 0) ? (
              <div className="h-52 sm:h-64 min-w-0 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={stats.chartData} margin={{ top: 6, right: 6, bottom: 0, left: -14 }}>
                    <defs>
                      <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={v => [formatMoney(v), 'Ventas']}
                      contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', fontSize: '12px', padding: '8px 12px' }}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="var(--color-brand)" strokeWidth={2} fill="url(#gradVentas)"
                      dot={{ r: 3, fill: 'var(--color-brand)' }} activeDot={{ r: 5, fill: 'var(--color-brand)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 sm:h-64 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <TrendingUp size={28} className="text-slate-400 mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-800">Aún no hay ventas en los últimos 7 días</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Comparte el link de tu tienda en redes sociales y WhatsApp para empezar a registrar ventas.
                </p>
              </div>
            )}
          </PremiumLock>
        </section>

        <section className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={17} className="text-brand" aria-hidden="true" />
              <h3 className="text-base font-bold text-slate-950">Más vendidos</h3>
            </div>

            {stats.topProducts.length > 0 ? (
              <ol className="divide-y divide-slate-100">
                {stats.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>{i + 1}</span>
                      <span className="font-medium text-slate-800 truncate">{p.name}</span>
                    </div>
                    <span className="font-semibold text-slate-950 shrink-0 tabular-nums">{p.count} uds</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="py-8 text-center">
                <PackagePlus size={26} className="text-slate-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-700">Sin datos de ventas aún</p>
                <p className="text-xs text-slate-500 mt-0.5">Aparecerán cuando despaches pedidos</p>
              </div>
            )}
          </div>

          <button onClick={() => handleNavigate('products')} className="mt-3 pt-3 border-t border-slate-100 text-sm font-semibold text-brand hover:opacity-80 flex items-center justify-between w-full min-h-10">
            <span>Gestionar todos los productos</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </section>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Pedidos en vivo', tab: 'orders', icon: ShoppingBag, desc: 'Atiende clientes' },
          { label: 'Catálogo de menú', tab: 'products', icon: Package, desc: 'Precios e imágenes' },
          { label: 'Reporte de ventas', tab: 'revenue', icon: DollarSign, desc: 'Historial e ingresos' },
          { label: 'Configuración', tab: 'settings', icon: Settings, desc: 'Horarios y marca' },
        ].map(a => (
          <button key={a.tab} onClick={() => handleNavigate(a.tab)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand/40 hover:shadow-md transition-all text-left group active:scale-[0.98] min-h-[5.5rem]">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand/10 group-hover:text-brand transition-colors flex items-center justify-center mb-2.5">
              <a.icon size={17} aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-slate-950">{a.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

    </div>
  );
}
