import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500/12 text-primary-700',
        neutral: 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
        success: 'border-transparent bg-[var(--color-success)]/15 text-[var(--color-success)]',
        warning: 'border-transparent bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
        danger: 'border-transparent bg-[var(--color-error)]/15 text-[var(--color-error)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string;
  children: ReactNode;
}

export function Badge({ className, variant, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
