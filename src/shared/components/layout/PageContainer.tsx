import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  maxWidth = 'max-w-[1440px]',
  fullWidth,
}: PageContainerProps) {
  return (
    <div className={cn('min-h-full bg-transparent', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-12', !fullWidth && maxWidth)}
      >
        {/* Modern Page Header */}
        {(title || actions) && (
          <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title && (
                <h1 className="font-heading text-3xl font-bold tracking-tight text-[var(--color-neutral-900)] sm:text-4xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-base font-medium text-[var(--color-neutral-500)]">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3 self-start sm:self-center">
                {actions}
              </div>
            )}
          </div>
        )}

        {children}
      </motion.div>
    </div>
  );
}
