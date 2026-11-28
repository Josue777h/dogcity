import { useState, type FormEvent } from 'react';
import { X, Truck, Send } from 'lucide-react';
import { OrderService } from '../../services/orderService';
import { formatMoney } from '../../lib/utils';

interface QuotableOrder {
  id: number;
  token?: string | null;
  cliente_nombre?: string | null;
  cliente_telefono?: string | null;
  subtotal_amount?: number | null;
  total_amount?: number | null;
  total?: number | null;
}

interface OrderQuoteModalProps {
  order: QuotableOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onQuoted?: (updatedOrder: unknown) => void;
}

function formatWhatsAppNumber(raw?: string | null): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 && digits.startsWith('3') ? `57${digits}` : digits;
}

export default function OrderQuoteModal({ order, isOpen, onClose, onQuoted }: OrderQuoteModalProps) {
  const [feeInput, setFeeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const subtotal = Number(order.subtotal_amount ?? order.total_amount ?? order.total ?? 0);
  const parsedFee = Math.max(0, Number(String(feeInput).replace(/[^\d.]/g, '')) || 0);
  const newTotal = subtotal + parsedFee;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (parsedFee <= 0) {
      setError('Ingresa un valor de envío mayor a 0.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const updated = await OrderService.setDeliveryQuote(order.id, parsedFee, subtotal);
      const tokenQuery = order.token ? `?token=${encodeURIComponent(order.token)}` : '';
      const trackingUrl = `${window.location.origin}/tracking/${order.id}${tokenQuery}`;
      const phone = formatWhatsAppNumber(order.cliente_telefono);

      if (phone) {
        const shortId = String(order.id).slice(-6).toUpperCase();
        const message = [
          `Hola ${order.cliente_nombre || ''}, ya cotizamos el envío de tu pedido #${shortId}.`.trim(),
          `Subtotal: ${formatMoney(subtotal)}`,
          `Envío: ${formatMoney(parsedFee)}`,
          `Total: ${formatMoney(newTotal)}`,
          `Confirma tu pedido aquí: ${trackingUrl}`,
        ].join('\n');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      }

      onQuoted?.(updated);
      setFeeInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la cotización.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cotizar envío"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Truck size={16} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-950 tracking-tight">Cotizar envío</h3>
              <p className="truncate text-xs text-slate-500">
                Pedido #{String(order.id).slice(-6).toUpperCase()} · {order.cliente_nombre || 'Cliente'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="quote-delivery-fee" className="block text-xs font-medium text-slate-700 mb-1.5">
              Costo de envío
            </label>
            <input
              id="quote-delivery-fee"
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              required
              autoFocus
              value={feeInput}
              onChange={(e) => {
                setFeeInput(e.target.value);
                setError('');
              }}
              placeholder="Ej. 5000"
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="tabular-nums font-medium">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Envío</span>
              <span className="tabular-nums font-medium">{formatMoney(parsedFee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-1.5 text-sm font-semibold text-slate-950">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(newTotal)}</span>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 cursor-pointer rounded-lg border border-slate-200 px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || parsedFee <= 0}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
          >
            <Send size={14} strokeWidth={1.75} />
            <span>{saving ? 'Guardando...' : 'Guardar y enviar WhatsApp'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
