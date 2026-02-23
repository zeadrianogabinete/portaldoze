import { cn } from '@/shared/utils/cn';

type ViewMode = 'month' | 'week' | 'day' | 'list';

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const views: Array<{ value: ViewMode; label: string }> = [
  { value: 'month', label: 'Mês' },
  { value: 'week', label: 'Sem' },
  { value: 'day', label: 'Dia' },
  { value: 'list', label: 'Lista' },
];

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] p-0.5">
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          onClick={() => onChange(view.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
            value === view.value
              ? 'bg-white text-[var(--color-neutral-800)] shadow-sm'
              : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]',
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
