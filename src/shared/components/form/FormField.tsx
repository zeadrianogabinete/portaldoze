import { type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, description, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">
          {label}
          {required && <span className="ml-0.5 text-[var(--color-error)]">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-[var(--color-neutral-400)]">{description}</p>
      )}
      {error && (
        <p className="text-xs text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
