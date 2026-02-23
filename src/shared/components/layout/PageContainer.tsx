import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  fullWidth,
}: PageContainerProps) {
  return (
    <div className={cn(!fullWidth && 'mx-auto max-w-7xl', className)}>
      {(title || actions) && (
        <div className="mb-6 rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h1 className="font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
