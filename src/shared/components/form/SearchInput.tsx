import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative', containerClassName)}>
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]"
        />
        <input
          ref={ref}
          type="search"
          className={cn(
            'flex h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white pl-9 pr-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors',
            'placeholder:text-[var(--color-neutral-400)]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = 'SearchInput';
