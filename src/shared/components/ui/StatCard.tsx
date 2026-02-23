import type { LucideIcon } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const toneMap = {
  primary: {
    icon: 'text-primary-600',
    chip: 'bg-primary-500/12',
  },
  success: {
    icon: 'text-[var(--color-success)]',
    chip: 'bg-[var(--color-success)]/12',
  },
  warning: {
    icon: 'text-[var(--color-warning)]',
    chip: 'bg-[var(--color-warning)]/15',
  },
  danger: {
    icon: 'text-[var(--color-error)]',
    chip: 'bg-[var(--color-error)]/12',
  },
  info: {
    icon: 'text-[var(--color-info)]',
    chip: 'bg-[var(--color-info)]/12',
  },
};

export function StatCard({ title, value, description, icon: Icon, tone = 'primary' }: StatCardProps) {
  const palette = toneMap[tone];

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-neutral-500)]">{title}</span>
        <div className={cn('rounded-lg p-2', palette.chip)}>
          <Icon size={16} strokeWidth={1.75} className={palette.icon} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-neutral-900)]">{value}</p>
      {description && <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{description}</p>}
    </Card>
  );
}
