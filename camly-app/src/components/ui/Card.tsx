import { forwardRef, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, className = '', ...props }, ref,
) {
  return (
    <div
      ref={ref}
      className={`rounded-xl bg-white ${interactive ? 'transition-colors hover:bg-slate-50' : ''} ${className}`}
      {...props}
    />
  );
});

export default Card;
