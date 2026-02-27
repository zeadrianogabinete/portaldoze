'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { Switch } from '@/shared/components/form/Switch';
import { useNatureMutations, useSettingsCategories } from '../../hooks/useFinancialSettings';
import type { ExpenseNature } from '@/modules/financial/types/financial.types';

interface NatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nature?: ExpenseNature | null;
}

export function NatureDialog({ open, onOpenChange, nature }: NatureDialogProps) {
  const isEditing = !!nature;
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [elegivelCeap, setElegivelCeap] = useState(true);
  const [categoriaId, setCategoriaId] = useState('');

  const { data: categories } = useSettingsCategories();
  const { create, update } = useNatureMutations();
  const isLoading = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setCodigo(nature?.codigo ?? '');
      setNome(nature?.nome ?? '');
      setDescricao(nature?.descricao ?? '');
      setElegivelCeap(nature?.elegivel_ceap ?? true);
      setCategoriaId(nature?.categoria_id ?? '');
    }
  }, [open, nature]);

  function handleSubmit() {
    if (!codigo.trim() || !nome.trim()) return;

    const input = {
      codigo: codigo.trim(),
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      elegivel_ceap: elegivelCeap,
      categoria_id: categoriaId || undefined,
    };

    if (isEditing) {
      update.mutate(
        { id: nature!.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setCodigo('');
      setNome('');
      setDescricao('');
      setElegivelCeap(true);
      setCategoriaId('');
    }
    onOpenChange(value);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            {isEditing ? 'Editar natureza' : 'Nova natureza de despesa'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {isEditing ? 'Altere os dados da natureza.' : 'Preencha os dados para criar uma nova natureza.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="nat-codigo" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Código *
                </label>
                <input
                  id="nat-codigo"
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: 3.1"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label htmlFor="nat-categoria" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Categoria
                </label>
                <select
                  id="nat-categoria"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Nenhuma</option>
                  {categories?.filter(c => c.ativo).map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="nat-nome" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Nome *
              </label>
              <input
                id="nat-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da natureza"
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label htmlFor="nat-desc" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição
              </label>
              <textarea
                id="nat-desc"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição opcional"
                rows={2}
                className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2.5">
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">Elegível CEAP</span>
              <Switch checked={elegivelCeap} onCheckedChange={setElegivelCeap} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} disabled={!codigo.trim() || !nome.trim()}>
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
