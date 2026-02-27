'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { CurrencyInput } from '@/shared/components/form/CurrencyInput';
import { useQuotaMutations } from '../../hooks/useFinancialSettings';
import type { QuotaConfig } from '@/modules/financial/types/financial.types';

interface QuotaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quota: QuotaConfig | null;
}

export function QuotaEditDialog({ open, onOpenChange, quota }: QuotaEditDialogProps) {
  const [totalMensal, setTotalMensal] = useState(0);
  const [descricao, setDescricao] = useState('');

  const { update } = useQuotaMutations();
  const isLoading = update.isPending;

  useEffect(() => {
    if (open && quota) {
      setTotalMensal(quota.total_mensal);
      setDescricao(quota.descricao ?? '');
    }
  }, [open, quota]);

  function handleSubmit() {
    if (!quota || totalMensal <= 0) return;

    update.mutate(
      {
        id: quota.id,
        input: {
          total_mensal: totalMensal,
          descricao: descricao.trim() || undefined,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setTotalMensal(0);
      setDescricao('');
    }
    onOpenChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            Editar Cota CEAP
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Altere o valor da cota mensal CEAP.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="quota-valor" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Valor mensal *
              </label>
              <CurrencyInput
                value={totalMensal}
                onChange={setTotalMensal}
                placeholder="R$ 0,00"
              />
            </div>

            <div>
              <label htmlFor="quota-desc" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição
              </label>
              <textarea
                id="quota-desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional"
                rows={2}
                className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} disabled={totalMensal <= 0}>
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
  );
}
