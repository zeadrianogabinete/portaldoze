import { forwardRef, type ChangeEvent } from 'react';
import { Input } from './Input';

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const formatForDisplay = (val: number | string): string => {
      const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
      return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, '');
      const num = parseInt(raw, 10) / 100;
      onChange(isNaN(num) ? 0 : num);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-neutral-400)]">
          R$
        </span>
        <Input
          ref={ref}
          {...props}
          className="pl-9"
          value={formatForDisplay(value)}
          onChange={handleChange}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';
