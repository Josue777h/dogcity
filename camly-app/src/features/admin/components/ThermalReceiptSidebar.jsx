import { Link } from 'react-router-dom';
import { Printer } from 'lucide-react';
import {
  formatMoney,
  getOrderSubtotal,
  getGroupedOptionsList,
  printThermalReceipt,
} from '../../../lib/utils';

export default function ThermalReceiptSidebar({ order, business }) {
  const thermalCfg = business?.catalog_design?.thermal_config || {};
  const paperWidth = thermalCfg.paper_width === '58mm' ? '58mm' : '80mm';
  const nit = (thermalCfg.nit || '').trim();
  const customFooter = (thermalCfg.footer || '').trim();

  if (!order) {
    return (
      <aside className="hidden lg:block sticky top-4 rounded-2xl border border-slate-200/90 bg-white p-4">
        <div className="flex items-center gap-2 text-slate-800 pb-3 border-b border-slate-100">
          <Printer size={16} strokeWidth={1.75} className="text-emerald-700 shrink-0" />
          <h3 className="text-sm font-semibold tracking-tight">Comanda Térmica ({paperWidth})</h3>
        </div>
        <div className="py-10 text-center space-y-1">
          <p className="text-xs font-medium text-slate-600">Sin pedido seleccionado</p>
          <p className="text-[11px] text-slate-400">Haz clic en cualquier orden para previsualizar e imprimir su tirilla.</p>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Formato {paperWidth} listo
          </span>
          <Link to="/admin/configuracion?tab=impresion" className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-950">
            Ajustes térmicos
          </Link>
        </div>
      </aside>
    );
  }

  const shortId = String(order.id || '').slice(-4).toUpperCase();
  const dateObj = order.created_at ? new Date(order.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

  const isMesa = order.delivery_type === 'dine_in' || order.entrega_metodo === 'mesa' || Boolean(order.mesa || order.table_number);
  const isEnvio = !isMesa && (order.entrega_metodo === 'envio' || order.delivery_type === 'delivery' || order.delivery_type === 'fixed' || order.delivery_type === 'por_cotizar');
  const modeLabel = isMesa
    ? `MESA #${order.mesa || order.table_number || '1'}`
    : isEnvio
      ? 'DOMICILIO'
      : 'RECOGIDA';

  const items = Array.isArray(order.items || order.productos) ? (order.items || order.productos) : [];
  const subtotal = getOrderSubtotal(order);
  const domCost = Number(order.domicilio_costo ?? order.delivery_fee ?? 0);
  const total = Number(order.total_amount ?? order.total) || (subtotal + domCost);
  const distKm = order.distancia_km ? Number(order.distancia_km).toFixed(1) : null;

  const paymentLabel = order.pago_metodo === 'transferencia'
    ? 'TRANSFERENCIA'
    : order.pago_metodo === 'datafono'
      ? 'DATÁFONO'
      : 'EFECTIVO';

  return (
    <aside className="hidden lg:block sticky top-4 rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3.5">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Printer size={16} strokeWidth={1.75} className="text-emerald-700 shrink-0" />
          <h3 className="text-sm font-semibold tracking-tight text-slate-950 leading-tight">
            Comanda Térmica ({paperWidth})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => printThermalReceipt(order, business, { mode: 'bill' })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <Printer size={13} strokeWidth={2} />
          <span>Imprimir</span>
        </button>
      </div>

      {/* Papel térmico simulado */}
      <div className="rounded-xl border border-slate-200/80 bg-[#fafbfc] p-3.5 font-mono text-[11px] leading-relaxed text-slate-800 max-h-[calc(100dvh-13rem)] overflow-y-auto overscroll-contain">
        <div className="text-center space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-950">
            {business?.nombre_visible || business?.nombre || 'MI COMERCIO'}
          </p>
          {(nit || business?.direccion) && (
            <p className="text-[10px] text-slate-500 break-words">
              {[nit ? `NIT: ${nit}` : '', business?.direccion || ''].filter(Boolean).join(' • ')}
            </p>
          )}
          {(business?.whatsapp_contacto || business?.telefono) && (
            <p className="text-[10px] text-slate-500">
              WhatsApp: {business?.whatsapp_contacto || business?.telefono}
            </p>
          )}
        </div>

        <div className="my-2.5 border-t border-dashed border-slate-300" />

        <div className="flex items-center justify-between font-bold text-slate-950">
          <span>ORDEN #{shortId}</span>
          <span>{modeLabel}</span>
        </div>

        <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-600">
          <p>Fecha: {dateStr} - {timeStr}</p>
          {order.nombre && <p className="truncate">Cliente: {order.nombre}</p>}
          {order.telefono && <p>Tel: {order.telefono}</p>}
          {isEnvio && order.direccion && <p className="break-words">Dirección: {order.direccion}</p>}
        </div>

        <div className="my-2.5 border-t border-dashed border-slate-300" />

        <div className="space-y-2">
          {items.map((item, idx) => {
            const qty = Number(item.cantidad ?? item.quantity ?? 1);
            const name = String(item.nombre ?? item.name ?? 'Producto').toUpperCase();
            const unitPrice = Number(item.precio ?? item.price ?? 0);
            const optGroups = getGroupedOptionsList(
              item.opciones || item.options,
              item.opciones_texto || '',
              { includePrice: false }
            );
            const nota = (item.nota || '').trim();

            return (
              <div key={idx} className="space-y-0.5">
                <div className="flex items-start justify-between gap-2 font-bold text-slate-900">
                  <span className="break-words">{qty}x {name}</span>
                  <span className="tabular-nums shrink-0">{formatMoney(unitPrice * qty)}</span>
                </div>
                {optGroups.map((g, gIdx) => (
                  <p key={gIdx} className="pl-2 text-[10px] text-slate-500 break-words">
                    &gt; {g.title ? `${g.title}: ${g.value}` : g.value}
                  </p>
                ))}
                {nota && (
                  <p className="pl-2 text-[10px] font-semibold text-slate-700 break-words">
                    &gt; Nota: {nota}
                  </p>
                )}
              </div>
            );
          })}

          {isEnvio && (
            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
              <span>ENVIO DOMICILIO{distKm ? ` (${distKm} km)` : ''}</span>
              <span className="tabular-nums">{domCost > 0 ? formatMoney(domCost) : 'Por cotizar'}</span>
            </div>
          )}
        </div>

        <div className="my-2.5 border-t border-dashed border-slate-300" />

        <div className="flex items-baseline justify-between font-bold text-xs text-slate-950">
          <span>TOTAL:</span>
          <span className="tabular-nums text-sm">{formatMoney(total)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-700">
          <span>METODO PAGO:</span>
          <span className="font-semibold">{paymentLabel}</span>
        </div>

        <div className="my-2.5 border-t border-dashed border-slate-300" />

        <p className="text-center text-[10px] italic text-slate-500 leading-snug">
          {customFooter || '¡Gracias por elegirnos! Generado automáticamente por negu.pro'}
        </p>
      </div>

      {/* Pie de estado + enlace directo a ajustes térmicos */}
      <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Formato {paperWidth} OK</span>
        </span>
        <Link
          to="/admin/configuracion?tab=impresion"
          className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-950"
        >
          Ajustes térmicos
        </Link>
      </div>
    </aside>
  );
}
