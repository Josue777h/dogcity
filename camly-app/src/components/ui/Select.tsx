import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, hint, error, iconLeft, className = '', children, ...props }, ref,
) {
  const generatedId = useId();
  const selectId = id || props.name || generatedId;
  return (
    <div className="min-w-0 space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
      {iconLeft && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{iconLeft}</span>}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
        className={`block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50 ${iconLeft ? 'pl-10' : ''} ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      </div>
      {error && <p id={`${selectId}-error`} role="alert" className="text-xs text-rose-700">{error}</p>}
      {!error && hint && <p id={`${selectId}-hint`} className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Select;
