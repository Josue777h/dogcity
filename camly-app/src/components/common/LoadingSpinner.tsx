import type { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export default function LoadingSpinner({ size = 16, className = '', style, label }: LoadingSpinnerProps) {
  const borderWidth = Math.max(2, Math.round(size / 8));

  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent align-middle motion-reduce:animate-none ${className}`}
      style={{ width: size, height: size, borderWidth, ...style }}
    />
  );
}
