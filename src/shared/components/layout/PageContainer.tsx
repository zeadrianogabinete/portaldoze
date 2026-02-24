import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function PageContainer({ children, className, maxWidth = 'max-w-[1440px]' }: PageContainerProps) {
  return (
    <div className={cn('min-h-full bg-transparent', className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={cn('mx-auto w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-12', maxWidth)}
      >
        {children}
      </motion.div>
    </div>
  );
}
