'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { useFundingSourceMutations } from '../../hooks/useFinancialSettings';
import type { FundingSource } from '@/modules/financial/types/financial.types';

interface FundingSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: FundingSource | null;
}

export function FundingSourceDialog({ open, onOpenChange, source }: FundingSourceDialogProps) {
  const isEditing = !!source;
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'expense' | 'revenue'>('expense');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');

  const { create, update } = useFundingSourceMutations();
  const isLoading = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setNome(source?.nome ?? '');
      setTipo(source?.tipo ?? 'expense');
      setCodigo(source?.codigo ?? '');
      setDescricao(source?.descricao ?? '');
    }
  }, [open, source]);

  function handleSubmit() {
    if (!nome.trim()) return;

    const input = {
      nome: nome.trim(),
      tipo,
      codigo: codigo.trim() || undefined,
      descricao: descricao.trim() || undefined,
    };

    if (isEditing) {
      update.mutate(
        { id: source!.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setNome('');
      setTipo('expense');
      setCodigo('');
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
            {isEditing ? 'Editar fonte de recurso' : 'Nova fonte de recurso'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {isEditing ? 'Altere os dados da fonte.' : 'Preencha os dados para criar uma nova fonte de recurso.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fs-nome" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Nome *
                </label>
                <input
                  id="fs-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome da fonte"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label htmlFor="fs-tipo" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Tipo *
                </label>
                <select
                  id="fs-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as 'expense' | 'revenue')}
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="expense">Despesa</option>
                  <option value="revenue">Receita</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="fs-codigo" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Código
              </label>
              <input
                id="fs-codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Sigla ou código"
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label htmlFor="fs-desc" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição
              </label>
              <textarea
                id="fs-desc"
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
            <Button onClick={handleSubmit} loading={isLoading} disabled={!nome.trim()}>
              {isEditing ? 'Salvar' : 'Criar'}
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
