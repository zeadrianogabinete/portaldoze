import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-neutral-200)] bg-[var(--surface-card)] px-8 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)] border border-[var(--color-neutral-200)]/50">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-[var(--color-neutral-700)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-neutral-500)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
