import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors',
          'placeholder:text-[var(--color-neutral-400)]',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-neutral-50)]',
          error
            ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/20 focus:border-[var(--color-error)]'
            : 'border-[var(--color-neutral-200)]',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
