'use client';

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/components/form/Button';
import { formatCurrency } from '@/shared/utils/format';
import { useTransactionMutations, useDocumentMutations } from '../../hooks/useFinancial';

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  transactionDescricao: string;
  transactionValor: number;
  onSuccess?: () => void;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  transactionId,
  transactionDescricao,
  transactionValor,
  onSuccess,
}: PaymentConfirmDialogProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { markAsPaid } = useTransactionMutations();
  const { upload } = useDocumentMutations();

  const isLoading = markAsPaid.isPending || upload.isPending;

  function handleConfirm() {
    markAsPaid.mutate(
      { id: transactionId, pago_em: selectedDate },
      {
        onSuccess: () => {
          if (file) {
            upload.mutate(
              { movimentacaoId: transactionId, file, documentType: 'comprovante' },
              {
                onSuccess: () => {
                  resetAndClose();
                  onSuccess?.();
                },
              },
            );
          } else {
            resetAndClose();
            onSuccess?.();
          }
        },
      },
    );
  }

  function resetAndClose() {
    setFile(null);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setFile(null);
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    onOpenChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            Confirmar pagamento
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Confirme os dados abaixo para marcar esta transacao como paga.
          </Dialog.Description>

          {/* Resumo da transacao */}
          <div className="mt-4 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4">
            <p className="text-sm text-[var(--color-neutral-600)]">{transactionDescricao}</p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-neutral-800)]">
              {formatCurrency(transactionValor)}
            </p>
          </div>

          {/* Data do pagamento */}
          <div className="mt-4">
            <label
              htmlFor="pago-em"
              className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]"
            >
              Data do pagamento
            </label>
            <input
              id="pago-em"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Upload de comprovante */}
          <div className="mt-4">
            <label
              htmlFor="comprovante"
              className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]"
            >
              Comprovante (opcional)
            </label>
            <div
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[var(--color-neutral-300)] px-4 py-3 transition-colors hover:border-primary-500 hover:bg-primary-500/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} className="text-[var(--color-neutral-400)]" />
              <span className="text-sm text-[var(--color-neutral-500)]">
                {file ? file.name : 'Selecionar arquivo (PDF, JPG, PNG)'}
              </span>
            </div>
            <input
              ref={fileInputRef}
              id="comprovante"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Botoes */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} loading={isLoading}>
              Confirmar pagamento
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
