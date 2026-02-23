import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency } from '@/shared/utils/format';
import { useDashboard } from '@/modules/financial/hooks/useDashboard';

interface FinancialDashboardProps {
  currentMonth: Date;
}

export function FinancialDashboard({ currentMonth }: FinancialDashboardProps) {
  const monthStr = format(currentMonth, 'yyyy-MM-01');
  const { summary, isLoading } = useDashboard(monthStr);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  const cards = [
    {
      label: 'Receitas',
      value: summary?.total_revenue ?? 0,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
    },
    {
      label: 'Despesas',
      value: summary?.total_expense ?? 0,
      icon: TrendingDown,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
    },
    {
      label: 'Saldo',
      value: summary?.balance ?? 0,
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Cota CEAP',
      value: null,
      icon: PieChart,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500',
      extra: summary ? `${summary.paid_count} pagos, ${summary.pending_count} pendentes, ${summary.overdue_count} atrasados` : '',
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              'rounded-xl border border-[var(--color-neutral-200)] p-5 shadow-[var(--shadow-card)]',
              card.bgColor,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-neutral-600)]">
                {card.label}
              </span>
              <card.icon size={20} className={card.iconColor} strokeWidth={1.5} />
            </div>
            {card.value !== null ? (
              <p className={cn('mt-2 font-heading text-2xl font-bold', card.textColor)}>
                {formatCurrency(card.value)}
              </p>
            ) : (
              <p className={cn('mt-2 text-sm', card.textColor)}>
                {card.extra}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Placeholder para gráficos futuros */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
            Receitas vs Despesas
          </h3>
          <div className="mt-8 flex items-center justify-center py-12 text-sm text-[var(--color-neutral-400)]">
            Gráfico em desenvolvimento
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
            Despesas por Natureza
          </h3>
          <div className="mt-8 flex items-center justify-center py-12 text-sm text-[var(--color-neutral-400)]">
            Gráfico em desenvolvimento
          </div>
        </div>
      </div>
    </div>
  );
}
