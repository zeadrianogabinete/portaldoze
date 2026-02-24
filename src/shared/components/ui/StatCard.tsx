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
    icon: 'text-primary-500',
    chip: 'bg-primary-50 border-primary-100',
  },
  success: {
    icon: 'text-emerald-500',
    chip: 'bg-emerald-50 border-emerald-100',
  },
  warning: {
    icon: 'text-amber-500',
    chip: 'bg-amber-50 border-amber-100',
  },
  danger: {
    icon: 'text-red-500',
    chip: 'bg-red-50 border-red-100',
  },
  info: {
    icon: 'text-blue-500',
    chip: 'bg-blue-50 border-blue-100',
  },
};

export function StatCard({ title, value, description, icon: Icon, tone = 'primary' }: StatCardProps) {
  const palette = toneMap[tone];

  return (
    <Card className="p-6 group hover:border-primary-200/50 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110', palette.chip)}>
          <Icon size={22} strokeWidth={2} className={palette.icon} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-neutral-400)] mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight text-[var(--color-neutral-900)]">
          {value}
        </p>
        {description && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-neutral-500)]">
              {description}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
