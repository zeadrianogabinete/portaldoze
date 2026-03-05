import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Copy, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransactions, useTransactionMutations } from '@/modules/financial/hooks/useFinancial';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import { DataTable, type Column } from '@/shared/components/form/DataTable';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import type { Transaction } from '@/modules/financial/types/financial.types';

export const Route = createFileRoute('/_authenticated/financial/revenues')({
  component: Receitas,
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

function Receitas() {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: transactions, isLoading } = useTransactions({ tipo: 'revenue' });
  const { remove } = useTransactionMutations();

  const columns: Column<Transaction>[] = [
    {
      key: 'data',
      header: 'Data',
      sortable: true,
      filterable: true,
      filterType: 'date-range',
      accessor: (t) => t.data,
      render: (t) => <span className="text-[var(--color-neutral-600)]">{formatDate(t.data)}</span>,
    },
    {
      key: 'descricao',
      header: 'Descrição',
      sortable: true,
      filterable: true,
      filterType: 'text',
      accessor: (t) => t.descricao,
      render: (t) => <span className="font-medium text-[var(--color-neutral-800)]">{t.descricao}</span>,
    },
    {
      key: 'fonte_recurso',
      header: 'Fonte',
      sortable: true,
      filterable: true,
      filterType: 'select',
      accessor: (t) => t.fonte_recurso?.nome ?? '',
      render: (t) => <span className="text-[var(--color-neutral-500)]">{t.fonte_recurso?.nome ?? '—'}</span>,
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      filterable: true,
      filterType: 'number-range',
      className: 'text-right',
      accessor: (t) => t.valor,
      render: (t) => <span className="font-semibold text-green-600">{formatCurrency(t.valor)}</span>,
    },
    {
      key: 'situacao',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      className: 'text-center',
      accessor: (t) => t.situacao,
      filterOptions: Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l })),
      render: (t) => (
        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[t.situacao] ?? '')}>
          {statusLabels[t.situacao] ?? t.situacao}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (t) => (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
            onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
          >
            <MoreHorizontal size={16} />
          </button>
          {openMenu === t.id && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-[var(--color-neutral-200)] bg-white py-1 shadow-lg">
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]" onClick={() => { setOpenMenu(null); navigate({ to: '/financial/$id', params: { id: t.id } }); }}>
                  <Eye size={14} /> Ver detalhes
                </button>
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]" onClick={() => { setOpenMenu(null); navigate({ to: '/financial/new', search: { copyFrom: t.id } }); }}>
                  <Copy size={14} /> Copiar
                </button>
                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setOpenMenu(null); setDeleteId(t.id); }}>
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer
      title="Receitas"
      actions={
        <Link to="/financial/new" className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600">
          <Plus size={16} strokeWidth={2} />
          Nova Receita
        </Link>
      }
    >
      <DataTable
        columns={columns}
        data={transactions ?? []}
        keyExtractor={(t) => t.id}
        loading={isLoading}
        emptyMessage="Nenhuma receita registrada"
        onRowClick={(t) => navigate({ to: '/financial/$id', params: { id: t.id } })}
        mobileRender={(t) => (
          <div className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] transition-colors active:bg-[var(--color-neutral-50)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-neutral-800)]">{t.descricao}</p>
                <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                  {formatDate(t.data)} {t.fonte_recurso?.nome ? `· ${t.fonte_recurso.nome}` : ''}
                </p>
              </div>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[t.situacao] ?? '')}>
                {statusLabels[t.situacao] ?? t.situacao}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-base font-bold text-green-600">{formatCurrency(t.valor)}</span>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)]" title="Copiar" onClick={() => navigate({ to: '/financial/new', search: { copyFrom: t.id } })}>
                  <Copy size={14} />
                </button>
                <button type="button" className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-red-50 hover:text-red-500" title="Excluir" onClick={() => setDeleteId(t.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Excluir receita?"
        description="Esta ação não pode ser desfeita. A receita será permanentemente removida."
        confirmLabel="Excluir"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => { if (deleteId) remove.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }}
      />
    </PageContainer>
  );
}
