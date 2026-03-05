'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Button } from '@/shared/components/form/Button';
import { useReportMutations, useNatures, useFundingSources } from '../../hooks/useFinancial';

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
  const [tipoRelatorio, setTipoRelatorio] = useState<'export' | 'reimbursement'>('reimbursement');
  const [naturezaFilter, setNaturezaFilter] = useState('');
  const [fonteFilter, setFonteFilter] = useState('');
  const [apenasComComprovante, setApenasComComprovante] = useState(false);

  const { data: natures } = useNatures();
  const { data: fundingSources } = useFundingSources();
  const { create } = useReportMutations();
  const isLoading = create.isPending;

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
    setTipoRelatorio('reimbursement');
    setNaturezaFilter('');
    setFonteFilter('');
    setApenasComComprovante(false);
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg max-h-[90vh]">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            Novo relatório
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Configure o relatório e seus filtros de seleção de despesas.
          </Dialog.Description>

          {/* Tipo de relatório */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-neutral-700)]">
              Tipo de relatório
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  tipoRelatorio === 'reimbursement'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
                }`}
                onClick={() => setTipoRelatorio('reimbursement')}
              >
                Envio para Ressarcimento
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  tipoRelatorio === 'export'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)]'
                }`}
                onClick={() => setTipoRelatorio('export')}
              >
                Exportação Simples
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              {tipoRelatorio === 'reimbursement'
                ? 'Ao enviar, as despesas serão marcadas como enviadas para ressarcimento.'
                : 'Apenas uma exportação das despesas, sem marcar como enviadas.'}
            </p>
          </div>

          {/* Nome do relatório */}
          <div className="mt-4">
            <label htmlFor="report-nome" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
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
              <label htmlFor="report-inicio" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
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
              <label htmlFor="report-fim" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
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

          {/* Filtros avançados */}
          <div className="mt-4 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
              Filtros de seleção
            </p>

            <div className="space-y-3">
              {/* Natureza */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Natureza</label>
                <select
                  value={naturezaFilter}
                  onChange={(e) => setNaturezaFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-2.5 text-sm text-[var(--color-neutral-800)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Todas as naturezas</option>
                  {natures?.filter((n) => n.elegivel_ceap).map((n) => (
                    <option key={n.id} value={n.id}>{n.nome}</option>
                  ))}
                </select>
              </div>

              {/* Fonte de recurso */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Fonte de recurso</label>
                <select
                  value={fonteFilter}
                  onChange={(e) => setFonteFilter(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-2.5 text-sm text-[var(--color-neutral-800)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Todas as fontes</option>
                  {fundingSources?.map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              {/* Apenas com comprovante */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={apenasComComprovante}
                  onChange={(e) => setApenasComComprovante(e.target.checked)}
                  className="rounded border-[var(--color-neutral-300)]"
                />
                <span className="text-sm text-[var(--color-neutral-700)]">Apenas despesas com comprovante</span>
              </label>
            </div>
          </div>

          {/* Botões */}
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
