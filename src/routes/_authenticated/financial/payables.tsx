import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Search,
  Wallet,
} from 'lucide-react';
import { parseISO, differenceInDays, isToday } from 'date-fns';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Card } from '@/shared/components/ui/Card';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { usePayables } from '@/modules/financial/hooks/usePayables';
import { useTransactionMutations } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import type { Transaction } from '@/modules/financial/types/financial.types';
import type { LucideIcon } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/financial/payables')({
  component: ContasAPagar,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUrgencyInfo(transaction: Transaction) {
  if (transaction.status === 'overdue') {
    const days = transaction.due_date
      ? differenceInDays(new Date(), parseISO(transaction.due_date))
      : 0;
    return {
      className: 'bg-red-50 text-red-700',
      daysText: days > 0 ? `${days} dia${days > 1 ? 's' : ''} de atraso` : 'Atrasado',
    };
  }

  if (transaction.due_date && isToday(parseISO(transaction.due_date))) {
    return {
      className: 'bg-yellow-50 text-yellow-700',
      daysText: 'Vence hoje',
    };
  }

  if (transaction.due_date) {
    const days = differenceInDays(parseISO(transaction.due_date), new Date());
    if (days <= 3) {
      return {
        className: 'bg-orange-50 text-orange-700',
        daysText: `Vence em ${days} dia${days > 1 ? 's' : ''}`,
      };
    }
    if (days <= 7) {
      return {
        className: 'bg-yellow-50 text-yellow-700',
        daysText: `Vence em ${days} dias`,
      };
    }
    return {
      className: 'bg-blue-50 text-blue-700',
      daysText: `Vence em ${days} dias`,
    };
  }

  return {
    className: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
    daysText: 'Sem vencimento',
  };
}

// ---------------------------------------------------------------------------
// Section component (grupo de transações)
// ---------------------------------------------------------------------------

function PayablesSection({
  title,
  icon: Icon,
  accentColor,
  transactions,
  onMarkAsPaid,
  isPaying,
}: {
  title: string;
  icon: LucideIcon;
  accentColor: string;
  transactions: Transaction[];
  onMarkAsPaid: (id: string) => void;
  isPaying: boolean;
}) {
  if (transactions.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={1.75} className={accentColor} />
        <h2 className="text-sm font-semibold text-[var(--color-neutral-700)]">
          {title}
        </h2>
        <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-neutral-500)]">
          {transactions.length}
        </span>
      </div>

      {/* Tabela desktop */}
      <div className="hidden overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Natureza</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Vencimento</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Urgência</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-neutral-100)]">
            {transactions.map((t) => {
              const urgency = getUrgencyInfo(t);
              return (
                <tr key={t.id} className="transition-colors hover:bg-[var(--color-neutral-50)]">
                  <td className="px-4 py-3">
                    <Link
                      to="/financial/$id"
                      params={{ id: t.id }}
                      className="text-sm font-medium text-[var(--color-neutral-800)] hover:text-primary-600 hover:underline"
                    >
                      {t.description}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-500)]">
                    {t.nature?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-neutral-600)]">
                    {t.due_date ? formatDate(t.due_date) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', urgency.className)}>
                      {urgency.daysText}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(t.id)}
                      disabled={isPaying}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                    >
                      <Check size={12} strokeWidth={2} />
                      Pagar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="space-y-2 sm:hidden">
        {transactions.map((t) => {
          const urgency = getUrgencyInfo(t);
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/financial/$id"
                    params={{ id: t.id }}
                    className="text-sm font-medium text-[var(--color-neutral-800)] hover:text-primary-600"
                  >
                    {t.description}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                    {t.nature?.name ?? 'Sem natureza'}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                  {formatCurrency(t.amount)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.due_date && (
                    <span className="text-xs text-[var(--color-neutral-500)]">
                      {formatDate(t.due_date)}
                    </span>
                  )}
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', urgency.className)}>
                    {urgency.daysText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(t.id)}
                  disabled={isPaying}
                  className="flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                >
                  <Check size={12} strokeWidth={2} />
                  Pagar
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

function ContasAPagar() {
  const [search, setSearch] = useState('');
  const { summary, grouped, isLoading } = usePayables({
    search: search || undefined,
  });
  const { markAsPaid } = useTransactionMutations();

  const hasPayables =
    grouped.overdue.length > 0 ||
    grouped.dueToday.length > 0 ||
    grouped.upcoming.length > 0;

  return (
    <PageContainer title="Contas a Pagar">
      {/* Cards de resumo */}
      <div className="mb-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-yellow-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-neutral-600)]">Total Pendente</span>
            <Clock size={20} className="text-yellow-500" strokeWidth={1.5} />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-yellow-700">
            {formatCurrency(summary.totalPending)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {summary.countPending} despesa{summary.countPending !== 1 ? 's' : ''} pendente{summary.countPending !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-neutral-600)]">Total Atrasado</span>
            <AlertTriangle size={20} className="text-red-500" strokeWidth={1.5} />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-red-700">
            {formatCurrency(summary.totalOverdue)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {summary.countOverdue} despesa{summary.countOverdue !== 1 ? 's' : ''} atrasada{summary.countOverdue !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-neutral-600)]">Vence Hoje</span>
            <Calendar size={20} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-blue-700">
            {formatCurrency(summary.totalDueToday)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {summary.countDueToday} para pagar hoje
          </p>
        </Card>

        <Card className="bg-[var(--color-neutral-50)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-neutral-600)]">Próxima Semana</span>
            <CalendarClock size={20} className="text-[var(--color-neutral-500)]" strokeWidth={1.5} />
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
            {formatCurrency(summary.totalDueThisWeek)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {summary.countDueThisWeek} nos próximos 7 dias
          </p>
        </Card>
      </div>

      {/* Busca */}
      <div className="mb-4 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar contas a pagar..."
            className="flex h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 pl-9 text-sm placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !hasPayables ? (
        <EmptyState
          icon={<Wallet size={40} strokeWidth={1.5} />}
          title="Nenhuma conta a pagar"
          description="Não há despesas pendentes ou atrasadas no momento"
        />
      ) : (
        <div className="space-y-6">
          <PayablesSection
            title="Atrasadas"
            icon={AlertTriangle}
            accentColor="text-red-500"
            transactions={grouped.overdue}
            onMarkAsPaid={(id) => markAsPaid.mutate(id)}
            isPaying={markAsPaid.isPending}
          />
          <PayablesSection
            title="Vencem Hoje"
            icon={Calendar}
            accentColor="text-yellow-600"
            transactions={grouped.dueToday}
            onMarkAsPaid={(id) => markAsPaid.mutate(id)}
            isPaying={markAsPaid.isPending}
          />
          <PayablesSection
            title="Próximas"
            icon={CalendarClock}
            accentColor="text-blue-500"
            transactions={grouped.upcoming}
            onMarkAsPaid={(id) => markAsPaid.mutate(id)}
            isPaying={markAsPaid.isPending}
          />
        </div>
      )}
    </PageContainer>
  );
}
