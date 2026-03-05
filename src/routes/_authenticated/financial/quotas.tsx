import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Paperclip, Pencil, X } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/form/Button';
import { CurrencyInput } from '@/shared/components/form/CurrencyInput';
import { useEffectiveGeneralQuota, useQuotaUsage, useCeapExpenses, useMonthlyQuotaMutations } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/financial/quotas')({
  component: CotasCEAP,
});

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
};

function CotasCEAP() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const { data: monthlyLimit, isLoading: isLoadingQuota } = useEffectiveGeneralQuota(year, month);
  const { data: usage, isLoading } = useQuotaUsage(year, month);
  const { data: ceapExpenses, isLoading: isLoadingExpenses } = useCeapExpenses(year, month);

  const effectiveLimit = monthlyLimit ?? 0;
  const totalUsed = usage?.reduce((sum, item) => sum + (item.total_gasto ?? 0), 0) ?? 0;
  const remaining = effectiveLimit - totalUsed;
  const percentage = effectiveLimit > 0 ? (totalUsed / effectiveLimit) * 100 : 0;

  // Estado para edição de cotas
  const [editQuotaOpen, setEditQuotaOpen] = useState(false);
  const [editQuotaValue, setEditQuotaValue] = useState(0);
  const [editQuotaNatureId, setEditQuotaNatureId] = useState<string | null>(null);
  const [editQuotaLabel, setEditQuotaLabel] = useState('');

  const { upsert } = useMonthlyQuotaMutations();

  function openEditGeneralQuota() {
    setEditQuotaNatureId(null);
    setEditQuotaValue(effectiveLimit);
    setEditQuotaLabel('Cota Geral CEAP');
    setEditQuotaOpen(true);
  }

  function openEditNatureQuota(naturezaId: string, nome: string, currentValue: number) {
    setEditQuotaNatureId(naturezaId);
    setEditQuotaValue(currentValue);
    setEditQuotaLabel(nome);
    setEditQuotaOpen(true);
  }

  function handleSaveQuota() {
    if (editQuotaValue < 0) return;
    upsert.mutate(
      { ano: year, mes: month, natureza_id: editQuotaNatureId, valor: editQuotaValue },
      { onSuccess: () => setEditQuotaOpen(false) },
    );
  }

  return (
    <PageContainer title="Cota CEAP" subtitle="Cota para Exercício da Atividade Parlamentar">
      {/* Navegação por mês */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
          className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="min-w-[180px] text-center font-heading text-base font-semibold capitalize text-[var(--color-neutral-800)]">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
          className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Resumo geral */}
      <div className="mb-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Limite Mensal</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
                {isLoadingQuota ? '...' : formatCurrency(effectiveLimit)}
              </p>
              <button
                type="button"
                onClick={openEditGeneralQuota}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
                title="Editar cota geral deste mês"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Utilizado</p>
            <p className="mt-1 font-heading text-2xl font-bold text-red-600">{formatCurrency(totalUsed)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Disponível</p>
            <p className={cn('mt-1 font-heading text-2xl font-bold', remaining >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        {/* Barra de progresso geral */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-neutral-500)]">
            <span>{percentage.toFixed(1)}% utilizado</span>
            <span>{formatCurrency(totalUsed)} / {formatCurrency(effectiveLimit)}</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500',
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Uso por natureza com limites individuais */}
      <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">Uso por Natureza de Despesa</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !usage || usage.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-8 text-center text-sm text-[var(--color-neutral-400)] shadow-[var(--shadow-card)]">
          Nenhum gasto CEAP registrado neste mês
        </div>
      ) : (
        <div className="mb-8 space-y-2">
          {usage.map((item) => {
            const hasLimit = item.cota_mensal > 0;
            const pct = hasLimit ? (item.total_gasto / item.cota_mensal) * 100 : 0;
            const itemRemaining = hasLimit ? item.cota_mensal - item.total_gasto : 0;

            return (
              <div key={item.natureza_id ?? item.natureza_nome} className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                      {item.natureza_codigo && <span className="mr-1.5 text-xs text-[var(--color-neutral-400)]">{item.natureza_codigo}</span>}
                      {item.natureza_nome}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-neutral-800)]">
                        {formatCurrency(item.total_gasto)}
                        {hasLimit && (
                          <span className="ml-1 text-xs font-normal text-[var(--color-neutral-500)]">
                            / {formatCurrency(item.cota_mensal)}
                          </span>
                        )}
                      </p>
                    </div>
                    {item.natureza_id && (
                      <button
                        type="button"
                        onClick={() => openEditNatureQuota(item.natureza_id!, item.natureza_nome, item.cota_mensal)}
                        className="rounded-lg p-1 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
                        title="Editar cota desta natureza neste mês"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {hasLimit ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-[var(--color-neutral-500)]">
                      <span>{pct.toFixed(1)}% utilizado</span>
                      <span className={cn(itemRemaining >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {itemRemaining >= 0 ? `${formatCurrency(itemRemaining)} disponível` : `${formatCurrency(Math.abs(itemRemaining))} excedido`}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500',
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-[var(--color-neutral-400)]">Sem limite individual</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de despesas CEAP do mês */}
      <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">
        Despesas CEAP — {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
      </h3>
      {isLoadingExpenses ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : !ceapExpenses || ceapExpenses.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-8 text-center text-sm text-[var(--color-neutral-400)] shadow-[var(--shadow-card)]">
          Nenhuma despesa CEAP neste mês
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)] sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Natureza</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Status</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Comprov.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {ceapExpenses.map((e) => (
                  <tr
                    key={e.id}
                    className="cursor-pointer transition-colors hover:bg-[var(--color-neutral-50)]"
                    onClick={() => navigate({ to: '/financial/$id', params: { id: e.id } })}
                  >
                    <td className="px-4 py-2.5 text-sm text-[var(--color-neutral-600)]">{formatDate(e.data)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-[var(--color-neutral-800)]">{e.descricao}</td>
                    <td className="px-4 py-2.5 text-sm text-[var(--color-neutral-500)]">{e.natureza_nome}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-red-600">{formatCurrency(e.valor)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[e.situacao] ?? '')}>
                        {statusLabels[e.situacao] ?? e.situacao}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Paperclip
                        size={14}
                        className={cn(
                          'mx-auto',
                          e.tem_comprovante ? 'text-green-500' : 'text-[var(--color-neutral-300)]',
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                  <td colSpan={3} className="px-4 py-2.5 text-sm font-semibold text-[var(--color-neutral-700)]">Total</td>
                  <td className="px-4 py-2.5 text-right text-sm font-bold text-[var(--color-neutral-800)]">
                    {formatCurrency(ceapExpenses.reduce((sum, e) => sum + e.valor, 0))}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-2 sm:hidden">
            {ceapExpenses.map((e) => (
              <div
                key={e.id}
                className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-3 shadow-[var(--shadow-card)] transition-colors active:bg-[var(--color-neutral-50)]"
                onClick={() => navigate({ to: '/financial/$id', params: { id: e.id } })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-neutral-800)]">{e.descricao}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                      {formatDate(e.data)} · {e.natureza_nome}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Paperclip
                      size={12}
                      className={e.tem_comprovante ? 'text-green-500' : 'text-[var(--color-neutral-300)]'}
                    />
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusColors[e.situacao] ?? '')}>
                      {statusLabels[e.situacao] ?? e.situacao}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm font-bold text-red-600">{formatCurrency(e.valor)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dialog de edição de cota */}
      <Dialog.Root open={editQuotaOpen} onOpenChange={setEditQuotaOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
            <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
              Editar Cota — {format(currentMonth, 'MMM yyyy', { locale: ptBR })}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
              {editQuotaLabel}
            </Dialog.Description>

            <div className="mt-4">
              <label htmlFor="edit-quota-valor" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Valor da cota para este mês
              </label>
              <CurrencyInput
                value={editQuotaValue}
                onChange={setEditQuotaValue}
                placeholder="R$ 0,00"
              />
              <p className="mt-1.5 text-xs text-[var(--color-neutral-400)]">
                Alterações afetam apenas {format(currentMonth, 'MMMM/yyyy', { locale: ptBR })}. Meses anteriores mantêm seus valores.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditQuotaOpen(false)} disabled={upsert.isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSaveQuota} loading={upsert.isPending}>
                Salvar
              </Button>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 rounded-sm p-1 text-[var(--color-neutral-400)] transition-colors hover:text-[var(--color-neutral-600)]"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </PageContainer>
  );
}
