import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { usePageContext, type BreadcrumbItem } from '@/shared/context/PageContext';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  fullWidth?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageContainer({
  title,
  subtitle,
  actions,
  children,
  className,
  maxWidth = 'max-w-[1440px]',
  fullWidth,
  breadcrumbs,
}: PageContainerProps) {
  const { setPageTitle, setBreadcrumbs } = usePageContext();

  useEffect(() => {
    if (title) setPageTitle(title);
    if (breadcrumbs) setBreadcrumbs(breadcrumbs);
    return () => {
      setPageTitle('Painel Administrativo');
      setBreadcrumbs([]);
    };
  }, [title, breadcrumbs, setPageTitle, setBreadcrumbs]);

  const hasSubHeader = subtitle || actions;

  return (
    <div className={cn('min-h-full bg-transparent', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8', !fullWidth && maxWidth)}
      >
        {hasSubHeader && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {subtitle && (
              <p className="text-sm font-medium text-[var(--color-neutral-500)]">
                {subtitle}
              </p>
            )}
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
