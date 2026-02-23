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
    <div className="inline-flex rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-1">
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          onClick={() => onChange(view.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
            value === view.value
              ? 'bg-primary-500/10 text-primary-700'
              : 'text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]',
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
