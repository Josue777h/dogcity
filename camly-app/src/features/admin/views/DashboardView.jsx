import { ShoppingBag, TrendingUp, DollarSign, Package } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export default function DashboardView({ orders, products }) {
  const stats = [
    { 
      label: 'Pedidos Hoy', 
      value: orders.filter(o => o.created_at?.includes(new Date().toISOString().split('T')[0])).length, 
      icon: ShoppingBag, 
      color: 'blue' 
    },
    { 
      label: 'Ingresos Totales', 
      value: formatMoney(orders.reduce((s,o) => s + (o.total || 0), 0)), 
      icon: TrendingUp, 
      color: 'emerald' 
    },
    { 
      label: 'Ticket Promedio', 
      value: formatMoney(orders.length ? orders.reduce((s,o) => s + (o.total || 0), 0) / orders.length : 0), 
      icon: DollarSign, 
      color: 'amber' 
    },
    { 
      label: 'Catálogo', 
      value: products.length, 
      icon: Package, 
      color: 'slate' 
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-border p-6 rounded-[2rem] flex items-center gap-5 shadow-sm">
            <div className={`p-4 bg-bg-alt rounded-2xl`}>
              <stat.icon size={24} className={`text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-xl font-black text-dark tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips / Welcome */}
      <div className="bg-dark text-white p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase mb-4">
            Impulsa tus ventas <span className="text-brand">con Camly</span>
          </h2>
          <p className="text-white/60 font-medium mb-8">
            Tienes {orders.length} pedidos registrados. Comparte tu link en redes sociales para empezar a recibir pedidos por WhatsApp automáticamente.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Tienda Online Activa</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand/20 to-transparent pointer-events-none" />
        <Store size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
      </div>
    </div>
  );
}

function Store({ size, className }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  );
}
