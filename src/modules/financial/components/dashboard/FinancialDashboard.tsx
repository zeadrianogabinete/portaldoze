import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from '@tanstack/react-router';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { useDashboard } from '@/modules/financial/hooks/useDashboard';
import { useCategories, useNatures } from '@/modules/financial/hooks/useFinancial';
import { Card, CardTitle } from '@/shared/components/ui/Card';

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
  cancelled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
};

type FilterType = 'all' | 'ceap' | 'category' | 'nature';

interface FinancialDashboardProps {
  currentMonth: Date;
}

export function FinancialDashboard({ currentMonth }: FinancialDashboardProps) {
  const navigate = useNavigate();
  const monthStr = format(currentMonth, 'yyyy-MM-01');
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: ptBR });
  const { summary, overallBalance, recentTransactions, isLoading, isLoadingTransactions } = useDashboard(monthStr);

  const { data: categories } = useCategories();
  const { data: natures } = useNatures();

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedNatureId, setSelectedNatureId] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!recentTransactions) return [];
    switch (filterType) {
      case 'ceap':
        return recentTransactions.filter((t) => t.natureza?.elegivel_ceap === true);
      case 'category':
        if (!selectedCategoryId) return recentTransactions;
        return recentTransactions.filter((t) => t.categoria_id === selectedCategoryId);
      case 'nature':
        if (!selectedNatureId) return recentTransactions;
        return recentTransactions.filter((t) => t.natureza_id === selectedNatureId);
      default:
        return recentTransactions;
    }
  }, [recentTransactions, filterType, selectedCategoryId, selectedNatureId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  const cards = [
    {
      label: `Receitas de ${format(currentMonth, 'MMM', { locale: ptBR })}`,
      value: summary?.total_revenue ?? 0,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
    },
    {
      label: `Despesas de ${format(currentMonth, 'MMM', { locale: ptBR })}`,
      value: summary?.total_expense ?? 0,
      icon: TrendingDown,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
    },
    {
      label: 'Saldo Geral',
      value: overallBalance?.balance ?? 0,
      icon: DollarSign,
      bgColor: 'bg-blue-50',
      textColor: (overallBalance?.balance ?? 0) >= 0 ? 'text-blue-700' : 'text-red-700',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Movimentações do Mês',
      value: null,
      icon: PieChart,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500',
      extra: summary ? `${summary.paid_count} pagos, ${summary.pending_count} pendentes, ${summary.overdue_count} atrasados` : '',
    },
  ];

  const chipClass = (active: boolean) =>
    cn(
      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
      active
        ? 'bg-primary-500 text-white'
        : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-200)]',
    );

  const selectClass =
    'h-8 rounded-lg border border-[var(--color-neutral-200)] bg-white px-2 text-xs text-[var(--color-neutral-700)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={cn('p-5', card.bgColor)}
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
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={chipClass(filterType === 'all')}
          onClick={() => setFilterType('all')}
        >
          Todas
        </button>
        <button
          type="button"
          className={chipClass(filterType === 'ceap')}
          onClick={() => setFilterType('ceap')}
        >
          CEAP
        </button>

        <select
          value={filterType === 'category' ? selectedCategoryId : ''}
          onChange={(e) => {
            if (e.target.value) {
              setFilterType('category');
              setSelectedCategoryId(e.target.value);
            } else {
              setFilterType('all');
              setSelectedCategoryId('');
            }
          }}
          className={cn(selectClass, filterType === 'category' && 'border-primary-500 ring-2 ring-primary-500/20')}
        >
          <option value="">Categoria</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <select
          value={filterType === 'nature' ? selectedNatureId : ''}
          onChange={(e) => {
            if (e.target.value) {
              setFilterType('nature');
              setSelectedNatureId(e.target.value);
            } else {
              setFilterType('all');
              setSelectedNatureId('');
            }
          }}
          className={cn(selectClass, filterType === 'nature' && 'border-primary-500 ring-2 ring-primary-500/20')}
        >
          <option value="">Natureza</option>
          {natures?.map((n) => (
            <option key={n.id} value={n.id}>{n.codigo} — {n.nome}</option>
          ))}
        </select>

        {filterType !== 'all' && (
          <span className="text-xs text-[var(--color-neutral-400)]">
            {filteredTransactions.length} resultado{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Movimentações do mês */}
      <div className="mt-4">
        <Card className="p-6">
          <CardTitle>Movimentações de {monthLabel}</CardTitle>

          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="mt-4 py-8 text-center text-sm text-[var(--color-neutral-400)]">
              {filterType === 'all'
                ? 'Nenhuma movimentação registrada neste mês'
                : 'Nenhuma movimentação encontrada com o filtro aplicado'}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="mt-4 hidden overflow-hidden rounded-lg border border-[var(--color-neutral-200)] sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Tipo</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-neutral-100)]">
                    {filteredTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="cursor-pointer transition-colors hover:bg-[var(--color-neutral-50)]"
                        onClick={() => navigate({ to: '/financial/$id', params: { id: t.id } })}
                      >
                        <td className="px-4 py-2.5 text-sm text-[var(--color-neutral-600)]">{formatDate(t.data)}</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-[var(--color-neutral-800)]">{t.descricao}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                            t.tipo === 'revenue' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
                          )}>
                            {t.tipo === 'revenue' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={cn(
                          'px-4 py-2.5 text-right text-sm font-semibold',
                          t.tipo === 'revenue' ? 'text-green-600' : 'text-red-600',
                        )}>
                          {formatCurrency(t.valor)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[t.situacao] ?? '')}>
                            {statusLabels[t.situacao] ?? t.situacao}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="mt-4 space-y-2 sm:hidden">
                {filteredTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] p-3 transition-colors active:bg-[var(--color-neutral-50)]"
                    onClick={() => navigate({ to: '/financial/$id', params: { id: t.id } })}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--color-neutral-800)]">{t.descricao}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">{formatDate(t.data)}</p>
                      </div>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[t.situacao] ?? '')}>
                        {statusLabels[t.situacao] ?? t.situacao}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className={cn(
                        'text-xs font-semibold',
                        t.tipo === 'revenue' ? 'text-green-600' : 'text-red-600',
                      )}>
                        {t.tipo === 'revenue' ? 'Receita' : 'Despesa'}
                      </span>
                      <span className={cn(
                        'text-sm font-bold',
                        t.tipo === 'revenue' ? 'text-green-600' : 'text-red-600',
                      )}>
                        {formatCurrency(t.valor)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
