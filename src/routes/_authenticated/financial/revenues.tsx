import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransactions } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/financial/revenues')({
  component: Receitas,
});

function Receitas() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: transactions, isLoading } = useTransactions({
    type: 'revenue',
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Recebido',
    overdue: 'Atrasado',
    cancelled: 'Cancelado',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-green-50 text-green-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
  };

  return (
    <PageContainer
      title="Receitas"
      actions={
        <Link
          to="/financial/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          <Plus size={16} strokeWidth={2} />
          Nova Receita
        </Link>
      }
    >
      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar receitas..."
            className="flex h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white pl-9 pr-3 py-2 text-sm placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Recebido</option>
          <option value="overdue">Atrasado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={40} strokeWidth={1.5} />}
          title="Nenhuma receita"
          description="Ainda não há receitas registradas"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-[var(--shadow-card)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Fonte</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-neutral-100)]">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="cursor-pointer transition-colors hover:bg-[var(--color-neutral-50)]"
                  onClick={() => {}}
                >
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-600)]">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]">{t.description}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-500)]">{t.funding_source?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[t.status] ?? '')}>
                      {statusLabels[t.status] ?? t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
