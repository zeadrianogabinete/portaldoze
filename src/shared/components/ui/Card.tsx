import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-neutral-200)]/60 bg-[var(--surface-card)] p-6 shadow-card transition-all duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3 className={cn('font-heading text-base font-semibold text-[var(--color-neutral-800)]', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return (
    <p className={cn('text-sm text-[var(--color-neutral-500)]', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {children}
    </div>
  );
}
