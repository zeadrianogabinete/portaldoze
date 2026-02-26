'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { useEligibleTransactions, useReportMutations } from '../../hooks/useFinancial';

interface SelectTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  periodoInicio: string;
  periodoFim: string;
  onSuccess?: () => void;
}

export function SelectTransactionsDialog({
  open,
  onOpenChange,
  reportId,
  periodoInicio,
  periodoFim,
  onSuccess,
}: SelectTransactionsDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: transactions, isLoading: isLoadingTransactions } = useEligibleTransactions(
    periodoInicio,
    periodoFim,
  );
  const { link } = useReportMutations();
  const isLinking = link.isPending;

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (!transactions) return;
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  }

  const selectedTransactions = transactions?.filter((t) => selectedIds.has(t.id)) ?? [];
  const selectedCount = selectedTransactions.length;
  const selectedTotal = selectedTransactions.reduce((sum, t) => sum + t.valor, 0);

  function handleConfirm() {
    if (selectedCount === 0) return;

    link.mutate(
      { reportId, transactionIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          resetAndClose();
          onSuccess?.();
        },
      },
    );
  }

  function resetAndClose() {
    setSelectedIds(new Set());
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedIds(new Set());
    }
    onOpenChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            Selecionar transações
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Selecione as transações elegíveis para vincular a este relatório.
          </Dialog.Description>

          {/* Lista de transações */}
          <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-[var(--color-neutral-200)]">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[var(--color-neutral-500)]">
                Nenhuma transação elegível encontrada para o período selecionado
              </div>
            ) : (
              <>
                {/* Cabeçalho com selecionar tudo */}
                <div className="sticky top-0 flex items-center gap-3 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === transactions.length && transactions.length > 0}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500/20"
                  />
                  <span className="text-xs font-medium text-[var(--color-neutral-600)]">
                    Selecionar todas ({transactions.length})
                  </span>
                </div>

                {/* Linhas das transações */}
                {transactions.map((transaction) => (
                  <label
                    key={transaction.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-[var(--color-neutral-100)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--color-neutral-50)]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(transaction.id)}
                      onChange={() => toggleSelection(transaction.id)}
                      className="h-4 w-4 shrink-0 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500/20"
                    />
                    <span className="w-24 shrink-0 text-xs text-[var(--color-neutral-500)]">
                      {formatDate(transaction.data)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-neutral-800)]">
                      {transaction.descricao}
                    </span>
                    {transaction.natureza && (
                      <span className="shrink-0 rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs text-[var(--color-neutral-600)]">
                        {transaction.natureza.nome}
                      </span>
                    )}
                    <span className="w-28 shrink-0 text-right text-sm font-medium text-[var(--color-neutral-800)]">
                      {formatCurrency(transaction.valor)}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>

          {/* Rodapé com resumo */}
          {transactions && transactions.length > 0 && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--color-neutral-50)] px-4 py-2">
              <span className="text-sm text-[var(--color-neutral-600)]">
                {selectedCount} {selectedCount === 1 ? 'transação selecionada' : 'transações selecionadas'}
              </span>
              <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                {formatCurrency(selectedTotal)}
              </span>
            </div>
          )}

          {/* Botoes */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLinking}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              loading={isLinking}
              disabled={selectedCount === 0}
            >
              Vincular {selectedCount} {selectedCount === 1 ? 'transação' : 'transações'}
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
  );
}
