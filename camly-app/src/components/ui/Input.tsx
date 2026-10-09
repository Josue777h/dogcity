import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, iconLeft, iconRight, className = '', ...props }, ref,
) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  return (
    <div className="min-w-0 space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
      {iconLeft && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{iconLeft}</span>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`block w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${iconLeft ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''} ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
        {...props}
      />
      {iconRight && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">{iconRight}</span>}
      </div>
      {error && <p id={`${inputId}-error`} role="alert" className="text-xs text-rose-700">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Input;
