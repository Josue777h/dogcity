import type { HTMLAttributes } from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-rose-50 text-rose-800',
  info: 'bg-sky-50 text-sky-800',
  brand: 'bg-brand/10 text-brand',
};

export function Badge({ variant = 'neutral', dot = false, className = '', children, ...props }: BadgeProps) {
  const dots: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-400', success: 'bg-emerald-500', warning: 'bg-amber-500',
    danger: 'bg-rose-500', info: 'bg-sky-500', brand: 'bg-brand',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${variants[variant]} ${className}`} {...props}>
    {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} />}{children}
  </span>;
}

export default Badge;
