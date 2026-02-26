import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Copy, Eye, MoreHorizontal, Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransactions, useTransactionMutations } from '@/modules/financial/hooks/useFinancial';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: transactions, isLoading } = useTransactions({
    tipo: 'revenue',
    situacao: statusFilter || undefined,
    busca: search || undefined,
  });

  const { remove } = useTransactionMutations();

  return (
    <PageContainer
      title="Receitas"
      actions={
        <Link
          to="/financial/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <Plus size={16} strokeWidth={2} />
          Nova Receita
        </Link>
      }
    >
      {/* Filtros */}
      <div className="mb-4 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receitas..."
              className="flex h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 pl-9 text-sm placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Recebido</option>
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
          icon={<TrendingUp size={40} strokeWidth={1.5} />}
          title="Nenhuma receita"
          description="Ainda não há receitas registradas"
        />
      ) : (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Fonte</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Status</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer transition-colors hover:bg-[var(--color-neutral-50)]"
                    onClick={() => navigate({ to: '/financial/$id', params: { id: t.id } })}
                  >
                    <td className="px-4 py-3 text-sm text-[var(--color-neutral-600)]">{formatDate(t.data)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]">{t.descricao}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-neutral-500)]">{t.fonte_recurso?.nome ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(t.valor)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[t.situacao] ?? '')}>
                        {statusLabels[t.situacao] ?? t.situacao}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
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
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                                onClick={() => {
                                  setOpenMenu(null);
                                  navigate({ to: '/financial/$id', params: { id: t.id } });
                                }}
                              >
                                <Eye size={14} /> Ver detalhes
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]"
                                onClick={() => {
                                  setOpenMenu(null);
                                  navigate({ to: '/financial/new', search: { copyFrom: t.id } });
                                }}
                              >
                                <Copy size={14} /> Copiar
                              </button>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setDeleteId(t.id);
                                }}
                              >
                                <Trash2 size={14} /> Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="space-y-3 sm:hidden">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] transition-colors active:bg-[var(--color-neutral-50)]"
                onClick={() => navigate({ to: '/financial/$id', params: { id: t.id } })}
              >
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
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)]"
                      title="Copiar"
                      onClick={() => navigate({ to: '/financial/new', search: { copyFrom: t.id } })}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-red-50 hover:text-red-500"
                      title="Excluir"
                      onClick={() => setDeleteId(t.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dialog de exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => { if (!v) setDeleteId(null); }}
        title="Excluir receita?"
        description="Esta ação não pode ser desfeita. A receita será permanentemente removida."
        confirmLabel="Excluir"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteId) {
            remove.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </PageContainer>
  );
}
