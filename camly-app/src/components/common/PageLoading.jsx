import { LoaderCircle } from 'lucide-react';
import SaaSLogo from './SaaSLogo';

export default function PageLoading({
  title = 'Cargando NEGU',
  description = 'Estamos preparando todo para ti.',
  fullscreen = true,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center bg-slate-50 px-4 py-8 ${fullscreen ? 'min-h-dvh' : 'min-h-[260px]'}`}
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mb-6 flex justify-center">
          <SaaSLogo className="h-12 sm:h-14" />
        </div>
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-brand">
          <LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        <div className="mx-auto mt-5 h-1 w-28 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
