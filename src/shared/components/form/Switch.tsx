'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/shared/utils/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Switch({ checked, onCheckedChange, disabled, size = 'sm' }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-primary-500' : 'bg-[var(--color-neutral-300)]',
        disabled && 'cursor-not-allowed opacity-50',
        size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-white shadow-sm transition-transform',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5',
          checked
            ? size === 'sm' ? 'translate-x-[18px]' : 'translate-x-[22px]'
            : 'translate-x-[3px]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
