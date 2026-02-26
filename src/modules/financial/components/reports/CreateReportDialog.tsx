'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '@/shared/components/form/Button';
import { useReportMutations } from '../../hooks/useFinancial';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function generateReportName(periodoInicio: string): string {
  if (!periodoInicio) return '';
  try {
    const date = parseISO(periodoInicio);
    const monthName = format(date, 'MMMM', { locale: ptBR });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const year = format(date, 'yyyy');
    return `Relatório CEAP - ${capitalizedMonth} ${year}`;
  } catch {
    return '';
  }
}

export function CreateReportDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateReportDialogProps) {
  const now = new Date();
  const defaultInicio = format(startOfMonth(now), 'yyyy-MM-dd');
  const defaultFim = format(endOfMonth(now), 'yyyy-MM-dd');

  const [nome, setNome] = useState(generateReportName(defaultInicio));
  const [periodoInicio, setPeriodoInicio] = useState(defaultInicio);
  const [periodoFim, setPeriodoFim] = useState(defaultFim);

  const { create } = useReportMutations();
  const isLoading = create.isPending;

  // Auto-popula o nome quando as datas mudam
  useEffect(() => {
    if (periodoInicio) {
      setNome(generateReportName(periodoInicio));
    }
  }, [periodoInicio]);

  function handleConfirm() {
    if (!nome || !periodoInicio || !periodoFim) return;

    create.mutate(
      { nome, periodo_inicio: periodoInicio, periodo_fim: periodoFim },
      {
        onSuccess: () => {
          resetAndClose();
          onSuccess?.();
        },
      },
    );
  }

  function resetAndClose() {
    const today = new Date();
    const inicio = format(startOfMonth(today), 'yyyy-MM-dd');
    const fim = format(endOfMonth(today), 'yyyy-MM-dd');
    setNome(generateReportName(inicio));
    setPeriodoInicio(inicio);
    setPeriodoFim(fim);
    onOpenChange(false);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      const today = new Date();
      const inicio = format(startOfMonth(today), 'yyyy-MM-dd');
      const fim = format(endOfMonth(today), 'yyyy-MM-dd');
      setNome(generateReportName(inicio));
      setPeriodoInicio(inicio);
      setPeriodoFim(fim);
    }
    onOpenChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            Novo relatório de reembolso
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Preencha os dados abaixo para criar um novo relatório CEAP.
          </Dialog.Description>

          {/* Nome do relatório */}
          <div className="mt-4">
            <label
              htmlFor="report-nome"
              className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]"
            >
              Nome do relatório
            </label>
            <input
              id="report-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Relatório CEAP - Fevereiro 2026"
              className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Período */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="report-inicio"
                className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]"
              >
                Período início
              </label>
              <input
                id="report-inicio"
                type="date"
                value={periodoInicio}
                onChange={(e) => setPeriodoInicio(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label
                htmlFor="report-fim"
                className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]"
              >
                Período fim
              </label>
              <input
                id="report-fim"
                type="date"
                value={periodoFim}
                onChange={(e) => setPeriodoFim(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Botoes */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              loading={isLoading}
              disabled={!nome || !periodoInicio || !periodoFim}
            >
              Criar relatório
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
