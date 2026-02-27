'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { Switch } from '@/shared/components/form/Switch';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import { cn } from '@/shared/utils/cn';
import { useSettingsCategories, useCategoryMutations } from '../../hooks/useFinancialSettings';
import { CategoryDialog } from './CategoryDialog';
import type { ExpenseCategory } from '@/modules/financial/types/financial.types';

export function CategoriesSection() {
  const { data: categories } = useSettingsCategories();
  const { update, remove } = useCategoryMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseCategory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ExpenseCategory | null>(null);

  function openCreate() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: ExpenseCategory) {
    setEditItem(item);
    setDialogOpen(true);
  }

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
          Categorias ({categories?.length ?? 0})
        </h3>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {categories?.map((c) => (
          <div
            key={c.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2',
              !c.ativo && 'opacity-60',
            )}
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">{c.nome}</p>
              {c.descricao && (
                <p className="text-xs text-[var(--color-neutral-500)]">{c.descricao}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={c.ativo}
                onCheckedChange={(v) => update.mutate({ id: c.id, input: { ativo: v } })}
              />
              <button
                type="button"
                onClick={() => openEdit(c)}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(c)}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {categories?.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--color-neutral-400)]">Nenhuma categoria cadastrada</p>
        )}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editItem}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => { if (!v) setConfirmDelete(null); }}
        title="Excluir categoria"
        description={`Deseja realmente excluir "${confirmDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => {
          if (confirmDelete) {
            remove.mutate(confirmDelete.id, {
              onSuccess: () => setConfirmDelete(null),
            });
          }
        }}
      />
    </div>
  );
}
