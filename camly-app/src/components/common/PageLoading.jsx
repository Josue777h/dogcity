import SaaSLogo from './SaaSLogo';
import LoadingSpinner from './LoadingSpinner';

export default function PageLoading({
  label = 'Cargando NEGU',
  fullscreen = true,
}) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      className={`grid place-items-center bg-slate-50 px-4 py-8 ${fullscreen ? 'min-h-dvh' : 'min-h-[220px]'}`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <SaaSLogo className="h-12 sm:h-14" animated={false} />
        <LoadingSpinner size={30} className="text-brand" />
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
    </div>
  );
}
