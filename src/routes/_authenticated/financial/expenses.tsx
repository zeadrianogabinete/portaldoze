import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Search, Wallet } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransactions } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/financial/expenses')({
  component: Despesas,
});

function Despesas() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: transactions, isLoading } = useTransactions({
    type: 'expense',
    status: statusFilter || undefined,
    search: search || undefined,
  });

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

  return (
    <PageContainer
      title="Despesas"
      actions={
        <Link
          to="/financial/new"
          className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus size={16} strokeWidth={2} />
          Nova Despesa
        </Link>
      }
    >
      {/* Filtros */}
      <div className="mb-4 rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar despesas..."
            className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 pl-9 text-sm placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Atrasado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={<Wallet size={40} strokeWidth={1.5} />}
          title="Nenhuma despesa"
          description="Ainda não há despesas registradas"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Natureza</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-neutral-100)]">
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-600)]">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]">{t.description}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-500)]">{t.nature?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">{formatCurrency(t.amount)}</td>
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
