import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Calendar, Trash2, 
  Download, Clock, ArrowUpRight, BarChart3, AlertCircle 
} from 'lucide-react';
import { formatMoney, exportOrdersToCSV } from '../../../lib/utils';
import Select from '../../../components/ui/Select';
import { useToastStore } from '../../../stores';

export default function RevenueView(props) {
  const outletCtx = useOutletContext() || {};
  const orders = props.orders ?? outletCtx.orders ?? [];
  const business = props.business ?? outletCtx.business ?? null;

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
    addToast('Registro ocultado de la tabla', 'info');
  };

  const handleResetFilters = () => {
    setHiddenOrderIds([]);
    setRetention('all');
    if (bizId) {
      localStorage.setItem(hiddenKey, JSON.stringify([]));
      localStorage.setItem(retentionKey, 'all');
    }
    addToast('Registros restaurados', 'success');
  };

  // Filtered orders & calculations
  const { filteredOrders, stats } = useMemo(() => {
    const now = new Date();
    
    const getDaysDiff = (dateStr) => {
      const d = new Date(dateStr);
      const diffTime = Math.abs(now - d);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const visibleOrders = orders.filter((o) => {
      if (hiddenOrderIds.includes(o.id)) return false;
      if (retention !== 'all') {
        const days = Number(retention);
        if (getDaysDiff(o.created_at) > days) return false;
      }
      return true;
    });

    let daySales = 0;
    let weekSales = 0;
    let monthSales = 0;

    visibleOrders.forEach((o) => {
      const daysDiff = getDaysDiff(o.created_at);
      const oDate = new Date(o.created_at);
      
      if (oDate.toDateString() === now.toDateString()) {
        daySales += o.total || 0;
      }
      if (daysDiff <= 7) {
        weekSales += o.total || 0;
      }
      if (daysDiff <= 30) {
        monthSales += o.total || 0;
      }
    });

    return {
      filteredOrders: visibleOrders,
      stats: { daySales, weekSales, monthSales, totalCount: visibleOrders.length }
    };
  }, [orders, hiddenOrderIds, retention]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      addToast('No hay datos para exportar', 'warning');
      return;
    }
    const ok = exportOrdersToCSV(filteredOrders, business?.nombre_visible);
    if (ok) {
      addToast('Reporte detallado de ventas exportado con éxito', 'success');
    }
  };

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Ingresos y Rendimiento
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            Historial de ventas, filtros de conservación y reportes para contabilidad.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto shrink-0">
          {hiddenOrderIds.length > 0 && (
            <button 
              onClick={handleResetFilters} 
              className="btn-secondary py-2.5 px-3 text-xs font-semibold flex-1 sm:flex-initial justify-center"
            >
              Restaurar ({hiddenOrderIds.length})
            </button>
          )}
          <button 
            onClick={handleExportCSV} 
            className="btn-primary py-2.5 px-3 text-xs font-semibold flex-1 sm:flex-initial justify-center"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Ingresos hoy</p>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <DollarSign size={16} />
            </div>
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 tabular-nums tracking-tight">
            {formatMoney(stats.daySales)}
          </h4>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 mt-2">
            <ArrowUpRight size={13} /> Facturación del día
          </span>
        </div>

        <div className="card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Últimos 7 días</p>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 tabular-nums tracking-tight">
            {formatMoney(stats.weekSales)}
          </h4>
          <span className="text-xs text-gray-500 flex items-center gap-0.5 mt-2">
            Semana en curso
          </span>
        </div>

        <div className="card p-3.5 sm:p-4 bg-white border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Últimos 30 días</p>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <BarChart3 size={16} />
            </div>
          </div>
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 tabular-nums tracking-tight">
            {formatMoney(stats.monthSales)}
          </h4>
          <span className="text-xs text-gray-500 flex items-center gap-0.5 mt-2">
            {stats.totalCount} {stats.totalCount === 1 ? 'pedido registrado' : 'pedidos registrados'}
          </span>
        </div>
      </div>

      {/* Table Panel */}
      <div className="card overflow-hidden">
        {/* Table Control Bar */}
        <div className="p-4 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-800">Historial de pedidos</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Período:</label>
            <Select
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
              className="text-xs py-1.5 w-auto"
            >
              <option value="7">Últimos 7 días</option>
              <option value="15">Últimos 15 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="all">Todo el historial</option>
            </Select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          {filteredOrders.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-gray-500 font-medium">
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Fecha y hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4 text-center">Entrega</th>
                  <th className="py-3 px-4 text-center">Pago</th>
                  <th className="py-3 px-4 text-right">Envío</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-700">
                      #{o.id.toString().slice(-4).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} ·{' '}
                      {new Date(o.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{o.nombre}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={o.entrega_metodo === 'envio' ? 'badge badge-info text-[10px]' : 'badge badge-neutral text-[10px]'}>
                        {o.entrega_metodo === 'envio' ? 'Domicilio' : 'Local'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={o.pago_metodo === 'transferencia' ? 'badge badge-success text-[10px]' : 'badge badge-neutral text-[10px]'}>
                        {o.pago_metodo === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-500">
                      {o.entrega_metodo === 'envio' ? formatMoney(o.domicilio_costo || 0) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">
                      {formatMoney(o.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleHideOrder(o.id)}
                        className="btn-ghost p-1 text-gray-400 hover:text-gray-700"
                        title="Ocultar de la tabla"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500 space-y-2">
              <AlertCircle className="mx-auto text-gray-300" size={24} />
              <p className="text-xs font-semibold text-gray-700">No hay registros en este período</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Las órdenes procesadas aparecerán aquí para control de ingresos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
