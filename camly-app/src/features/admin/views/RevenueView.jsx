import { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, Trash2, 
  Download, Clock, ArrowUpRight, BarChart3, AlertCircle 
} from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import { useToastStore } from '../../../stores';

export default function RevenueView({ orders, business }) {
  const bizId = business?.id;
  const addToast = useToastStore(s => s.addToast);

  // Local Storage Keys
  const retentionKey = `camly_revenue_retention_${bizId}`;
  const hiddenKey = `camly_revenue_hidden_${bizId}`;

  // Local State
  const [retention, setRetention] = useState(() => {
    return localStorage.getItem(retentionKey) || 'all';
  });
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => {
    try {
      const stored = localStorage.getItem(hiddenKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save changes to LocalStorage
  useEffect(() => {
    if (bizId) {
      localStorage.setItem(retentionKey, retention);
    }
  }, [retention, bizId]);

  const handleHideOrder = (orderId) => {
    const updated = [...hiddenOrderIds, orderId];
    setHiddenOrderIds(updated);
    if (bizId) {
      localStorage.setItem(hiddenKey, JSON.stringify(updated));
    }
    addToast('Registro depurado de la interfaz', 'info');
  };

  const handleResetFilters = () => {
    setHiddenOrderIds([]);
    setRetention('all');
    if (bizId) {
      localStorage.setItem(hiddenKey, JSON.stringify([]));
      localStorage.setItem(retentionKey, 'all');
    }
    addToast('Filtros y registros restaurados', 'success');
  };

  // Filtered orders & calculations based on retention & manual deletion
  const { filteredOrders, stats } = useMemo(() => {
    const now = new Date();
    
    // Helper to calculate date diff in days
    const getDaysDiff = (dateStr) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(now - d);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Filter out hidden and out-of-retention orders
    const visibleOrders = orders.filter((o) => {
      // 1. Filter out hidden
      if (hiddenOrderIds.includes(o.id)) return false;
      
      // 2. Filter out based on conservation policy
      if (retention !== 'all') {
        const days = Number(retention);
        if (getDaysDiff(o.created_at) > days) return false;
      }
      
      return true;
    });

    // Calculate metrics
    let daySales = 0;
    let weekSales = 0;
    let monthSales = 0;

    visibleOrders.forEach((o) => {
      const daysDiff = getDaysDiff(o.created_at);
      const oDate = new Date(o.created_at);
      
      // Sales of the day (today)
      if (oDate.toDateString() === now.toDateString()) {
        daySales += o.total || 0;
      }
      
      // Sales of the week (last 7 days)
      if (daysDiff <= 7) {
        weekSales += o.total || 0;
      }

      // Sales of the month (last 30 days)
      if (daysDiff <= 30) {
        monthSales += o.total || 0;
      }
    });

    return {
      filteredOrders: visibleOrders,
      stats: { daySales, weekSales, monthSales, totalCount: visibleOrders.length }
    };
  }, [orders, hiddenOrderIds, retention]);

  // Export to Excel-compatible CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      addToast('No hay datos para exportar', 'warning');
      return;
    }

    const headers = [
      'ID Pedido', 
      'Fecha', 
      'Cliente', 
      'Teléfono', 
      'Método Entrega', 
      'Método Pago', 
      'Costo Domicilio', 
      'Total'
    ];
    
    const rows = filteredOrders.map(o => [
      `#${o.id.toString().slice(-6).toUpperCase()}`,
      new Date(o.created_at).toLocaleString('es-ES'),
      o.nombre,
      o.telefono,
      o.entrega_metodo === 'envio' ? 'Domicilio' : 'Recogida',
      o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo',
      o.domicilio_costo || 0,
      o.total
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + 'sep=;\n' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_rendimiento_${business?.nombre_visible || 'negocio'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Reporte descargado con éxito', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-dark tracking-tighter uppercase">
            Rendimiento y <span className="text-brand">Ventas</span>
          </h2>
          <p className="text-sm text-muted font-medium mt-1">
            Visualiza el historial financiero de tu negocio, administra la retención y descarga reportes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hiddenOrderIds.length > 0 && (
            <button 
              onClick={handleResetFilters} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-dark hover:border-brand/40 hover:text-brand transition-all shadow-sm"
            >
              Restaurar ({hiddenOrderIds.length})
            </button>
          )}
          <button 
            onClick={handleExportCSV} 
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
          >
            <Download size={14} /> Descargar Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-3d bg-white border border-border p-6 rounded-[2.5rem] shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-brand/5 text-brand rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={12} /> Hoy
            </div>
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Ingresos del Día</p>
          <h3 className="text-2xl font-black text-dark tracking-tighter mt-1">{formatMoney(stats.daySales)}</h3>
        </div>

        <div className="card-3d bg-white border border-border p-6 rounded-[2.5rem] shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/5 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={12} /> Semanal
            </div>
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Últimos 7 días</p>
          <h3 className="text-2xl font-black text-dark tracking-tighter mt-1">{formatMoney(stats.weekSales)}</h3>
        </div>

        <div className="card-3d bg-white border border-border p-6 rounded-[2.5rem] shadow-sm group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-success/5 text-success rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <BarChart3 size={24} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg">
              <ArrowUpRight size={12} /> Mensual
            </div>
          </div>
          <p className="text-[10px] font-black text-muted uppercase tracking-widest">Últimos 30 días</p>
          <h3 className="text-2xl font-black text-dark tracking-tighter mt-1">{formatMoney(stats.monthSales)}</h3>
        </div>
      </div>

      {/* Configuration + Table Panel */}
      <div className="bg-white border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-6 border-b border-border/50 bg-bg-alt/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-dark uppercase tracking-wider">Historial de Ventas</h4>
              <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Filtros aplicados en tiempo real</p>
            </div>
          </div>

          {/* Retention Setting */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 border border-border rounded-xl">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Conservar registros:</label>
            <select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="bg-transparent text-[10px] font-black text-dark outline-none cursor-pointer"
            >
              <option value="7">Últimos 7 días</option>
              <option value="15">Últimos 15 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="all">Histórico Completo</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          {filteredOrders.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-bg-alt/10 text-[9px] font-black text-muted uppercase tracking-widest">
                  <th className="py-4 px-6">Pedido</th>
                  <th className="py-4 px-6">Fecha y Hora</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6 text-center">Entrega</th>
                  <th className="py-4 px-6 text-center">Pago</th>
                  <th className="py-4 px-6 text-right">Envío</th>
                  <th className="py-4 px-6 text-right">Total</th>
                  <th className="py-4 px-6 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="text-xs text-dark hover:bg-bg-alt/20 transition-colors">
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-brand/10 text-brand rounded-md font-black text-[9px] tracking-wider">
                        #{o.id.toString().slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-muted">
                      {new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} -{' '}
                      {new Date(o.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 font-bold">{o.nombre}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                        ${o.entrega_metodo === 'envio' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                        {o.entrega_metodo === 'envio' ? 'Domicilio' : 'Local'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                        ${o.pago_metodo === 'transferencia' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-600'}`}>
                        {o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-black text-muted opacity-80">
                      {o.entrega_metodo === 'envio' ? formatMoney(o.domicilio_costo || 0) : '—'}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-brand text-sm">{formatMoney(o.total)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleHideOrder(o.id)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full transition-all"
                        title="Ocultar de la interfaz"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-muted space-y-3">
              <AlertCircle className="mx-auto text-muted/30" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">No hay registros de ventas visibles</p>
              <p className="text-[10px] text-muted max-w-xs mx-auto">
                Es posible que no se hayan generado ventas en el rango configurado o que se hayan depurado todos los registros.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
