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
      className={`flex flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-8 ${fullscreen ? 'min-h-dvh' : 'min-h-[220px]'}`}
    >
      <SaaSLogo className="h-12 sm:h-14" animated={false} />
      <LoadingSpinner size={32} className="text-brand" />
    </div>
  );
}
