import { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Copy, Check, CreditCard, ExternalLink } from 'lucide-react';
import { useBusinessStore } from '../../stores';

const PLAN_BENEFITS = [
  'Catálogo digital y grupos de opciones ilimitados',
  'Pedidos estructurados a WhatsApp y seguimiento en vivo',
  'Comandero de mesas, cocina e impresión térmica Bluetooth',
  'Gestión de repartidores y reportes de ventas en CSV',
];

const NEQUI_NUMBER = '3143243707';

export default function BillingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const business = useBusinessStore((s) => s.business);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-billing-modal', handleOpen);
    return () => window.removeEventListener('open-billing-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const whatsappNumber = '573143243707';
  const businessLabel = business?.nombre_visible ? `${business.nombre_visible} ` : '';
  const message = `Hola! Quiero activar el Plan Pro en NEGU para ${businessLabel}(ID de tienda: ${business?.id || 'sin-id'}).`;

  const handleCopyNequi = () => {
    navigator.clipboard.writeText(NEQUI_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-200 overflow-hidden shadow-xl animate-fade-in">
        <div className="bg-slate-950 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-xl bg-brand/20 text-sky-300 flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 id="billing-modal-title" className="text-lg font-bold tracking-tight">
                Plan Pro de NEGU
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Todo incluido para operar tu negocio sin límites.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-2xl font-bold text-slate-950 tabular-nums">$60.000 COP</span>
              <span className="text-xs font-medium text-slate-500"> / mes</span>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              0% comisión por pedido
            </span>
          </div>

          <ul className="space-y-2.5">
            {PLAN_BENEFITS.map((feat) => (
              <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Transferencia Nequi
              </p>
              <p className="text-base font-mono font-bold text-slate-950 mt-0.5">{NEQUI_NUMBER}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyNequi}
              className="shrink-0 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full min-h-11 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <span>Enviar comprobante por WhatsApp</span>
              <ExternalLink size={15} />
            </a>
            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>Activación verificada para mantener tu tienda operando</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
