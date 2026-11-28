import { useEffect, useState } from 'react';
import { Check, Clock, RotateCcw, X } from 'lucide-react';
import { formatMoney } from '../../lib/utils';

interface QuoteBannerProps {
  status: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  confirmedAt?: string | null;
  busy?: boolean;
  onAccept: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
  onGraceExpired?: () => void | Promise<void>;
}

const GRACE_WINDOW_SECONDS = 60;

function computeRemainingSeconds(confirmedAt?: string | null): number {
  if (!confirmedAt) return GRACE_WINDOW_SECONDS;
  const elapsed = Math.floor((Date.now() - new Date(confirmedAt).getTime()) / 1000);
  return Math.max(0, GRACE_WINDOW_SECONDS - elapsed);
}

export default function QuoteBanner({
  status,
  subtotalAmount,
  deliveryFee,
  totalAmount,
  confirmedAt,
  busy = false,
  onAccept,
  onReject,
  onGraceExpired,
}: QuoteBannerProps) {
  const normalized = String(status || '').toUpperCase();
  const isQuoteSent = normalized === 'COTIZACION_ENVIADA';
  const isGrace = normalized === 'CONFIRMADO_GRACIA';

  const [secondsLeft, setSecondsLeft] = useState(() => computeRemainingSeconds(confirmedAt));
  const [expiredTriggered, setExpiredTriggered] = useState(false);

  useEffect(() => {
    if (!isGrace) return undefined;
    const tick = () => {
      const remaining = computeRemainingSeconds(confirmedAt);
      setSecondsLeft(remaining);
      if (remaining <= 0 && !expiredTriggered) {
        setExpiredTriggered(true);
        onGraceExpired?.();
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isGrace, confirmedAt, expiredTriggered, onGraceExpired]);

  if (!isQuoteSent && !isGrace) return null;

  if (isQuoteSent) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Cotización lista</p>
          <h2 className="text-base font-semibold tracking-tight text-slate-950">
            Confirma el valor del envío
          </h2>
          <p className="text-xs text-slate-500">
            Revisa el resumen antes de pasar tu pedido a preparación.
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">{formatMoney(subtotalAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Envío</span>
            <span className="tabular-nums font-medium">{formatMoney(deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-1.5 text-sm font-semibold text-slate-950">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(totalAmount)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={onAccept}
            className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
          >
            <Check size={15} strokeWidth={2} />
            <span>Aceptar y Confirmar</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onReject}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 active:scale-[0.98]"
          >
            <X size={15} strokeWidth={2} />
            <span>Rechazar Pedido</span>
          </button>
        </div>
      </section>
    );
  }

  const progressPct = Math.min(100, Math.max(0, (secondsLeft / GRACE_WINDOW_SECONDS) * 100));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock size={16} strokeWidth={1.75} className="shrink-0 text-slate-600" />
          <p className="text-xs font-semibold text-slate-900">
            Pedido confirmado · Pasa a preparación en{' '}
            <span className="font-mono tabular-nums text-sky-700">{secondsLeft}s</span>
          </p>
        </div>
        <button
          type="button"
          disabled={busy || secondsLeft <= 0}
          onClick={onReject}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RotateCcw size={13} strokeWidth={1.75} />
          <span>Deshacer</span>
        </button>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </section>
  );
}
