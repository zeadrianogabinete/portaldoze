import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useFixedExpenses } from '@/modules/financial/hooks/useFinancial';
import { DataTable, type Column } from '@/shared/components/form/DataTable';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import type { FixedExpense } from '@/modules/financial/types/financial.types';

export const Route = createFileRoute('/_authenticated/financial/fixed')({
  component: DespesasFixas,
});

function DespesasFixas() {
  const { data: fixedExpenses, isLoading } = useFixedExpenses();

  const columns: Column<FixedExpense>[] = [
    {
      key: 'descricao',
      header: 'Descrição',
      sortable: true,
      filterable: true,
      filterType: 'text',
      accessor: (e) => e.descricao,
      render: (e) => <span className="font-medium text-[var(--color-neutral-800)]">{e.descricao}</span>,
    },
    {
      key: 'natureza',
      header: 'Natureza',
      sortable: true,
      filterable: true,
      filterType: 'select',
      accessor: (e) => e.natureza?.nome ?? '',
      render: (e) => <span className="text-[var(--color-neutral-500)]">{e.natureza?.nome ?? '—'}</span>,
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      filterable: true,
      filterType: 'number-range',
      className: 'text-right',
      accessor: (e) => e.valor,
      render: (e) => <span className="font-semibold text-[var(--color-neutral-800)]">{formatCurrency(e.valor)}</span>,
    },
    {
      key: 'dia_vencimento',
      header: 'Dia Venc.',
      sortable: true,
      className: 'text-center',
      accessor: (e) => e.dia_vencimento,
      render: (e) => <span className="text-[var(--color-neutral-600)]">Dia {e.dia_vencimento ?? '—'}</span>,
    },
    {
      key: 'ativo',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      className: 'text-center',
      accessor: (e) => e.ativo ? 'Ativa' : 'Inativa',
      filterOptions: [{ value: 'Ativa', label: 'Ativa' }, { value: 'Inativa', label: 'Inativa' }],
      render: (e) => (
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-semibold',
          e.ativo ? 'bg-[var(--color-success)]/12 text-[var(--color-success)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
        )}>
          {e.ativo ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ];

  return (
    <PageContainer title="Despesas Fixas" subtitle="Despesas recorrentes mensais">
      <DataTable
        columns={columns}
        data={fixedExpenses ?? []}
        keyExtractor={(e) => e.id}
        loading={isLoading}
        emptyMessage="Nenhuma despesa fixa cadastrada"
        mobileRender={(e) => (
          <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">{e.descricao}</p>
                <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                  Dia {e.dia_vencimento ?? '—'} · {e.natureza?.nome ?? 'Sem natureza'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--color-neutral-800)]">{formatCurrency(e.valor)}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  e.ativo ? 'bg-[var(--color-success)]/12 text-[var(--color-success)]' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
                )}>
                  {e.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>
        )}
      />
    </PageContainer>
  );
}
