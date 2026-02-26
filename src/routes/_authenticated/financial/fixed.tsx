import { createFileRoute } from '@tanstack/react-router';
import { Repeat } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useFixedExpenses } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/financial/fixed')({
  component: DespesasFixas,
});

function DespesasFixas() {
  const { data: fixedExpenses, isLoading } = useFixedExpenses();

  return (
    <PageContainer title="Despesas Fixas" subtitle="Despesas recorrentes mensais">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !fixedExpenses || fixedExpenses.length === 0 ? (
        <EmptyState
          icon={<Repeat size={40} strokeWidth={1.5} />}
          title="Nenhuma despesa fixa"
          description="Cadastre despesas recorrentes para automatizar lançamentos"
        />
      ) : (
        <div className="space-y-3">
          {fixedExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">{expense.descricao}</p>
                <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                  Dia {expense.dia_vencimento} de cada mês
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                  {formatCurrency(expense.valor)}
                </span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  expense.ativo ? 'bg-[var(--color-success)]/12 text-[var(--color-success)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
                )}>
                  {expense.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
