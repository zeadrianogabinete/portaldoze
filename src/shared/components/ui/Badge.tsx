import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'border-primary-200 bg-primary-50 text-primary-600',
        neutral: 'border-neutral-200 bg-neutral-50 text-neutral-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-600',
        warning: 'border-amber-200 bg-amber-50 text-amber-600',
        danger: 'border-red-200 bg-red-50 text-red-600',
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
