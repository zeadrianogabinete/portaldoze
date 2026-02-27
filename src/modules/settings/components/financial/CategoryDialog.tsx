'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { useCategoryMutations } from '../../hooks/useFinancialSettings';
import type { ExpenseCategory } from '@/modules/financial/types/financial.types';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExpenseCategory | null;
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const isEditing = !!category;
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const { create, update } = useCategoryMutations();
  const isLoading = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setNome(category?.nome ?? '');
      setDescricao(category?.descricao ?? '');
    }
  }, [open, category]);

  function handleSubmit() {
    if (!nome.trim()) return;

    const input = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
    };

    if (isEditing) {
      update.mutate(
        { id: category!.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setNome('');
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
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {isEditing ? 'Altere os dados da categoria.' : 'Preencha os dados para criar uma nova categoria.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="cat-nome" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Nome *
              </label>
              <input
                id="cat-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da categoria"
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label htmlFor="cat-desc" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição
              </label>
              <textarea
                id="cat-desc"
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
