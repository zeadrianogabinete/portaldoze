'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { Switch } from '@/shared/components/form/Switch';
import { cn } from '@/shared/utils/cn';
import { useSettingsNatures, useNatureMutations } from '../../hooks/useFinancialSettings';
import { NatureDialog } from './NatureDialog';
import type { ExpenseNature } from '@/modules/financial/types/financial.types';

export function NaturesSection() {
  const { data: natures } = useSettingsNatures();
  const { update } = useNatureMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseNature | null>(null);

  function openCreate() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: ExpenseNature) {
    setEditItem(item);
    setDialogOpen(true);
  }

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
          Naturezas de Despesa ({natures?.length ?? 0})
        </h3>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {natures?.map((n) => (
          <div
            key={n.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2',
              !n.ativo && 'opacity-60',
            )}
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">{n.nome}</p>
              <p className="text-xs text-[var(--color-neutral-500)]">Código: {n.codigo}</p>
            </div>
            <div className="flex items-center gap-2">
              {n.elegivel_ceap && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">CEAP</span>
              )}
              <Switch
                checked={n.ativo}
                onCheckedChange={(v) => update.mutate({ id: n.id, input: { ativo: v } })}
              />
              <button
                type="button"
                onClick={() => openEdit(n)}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
        {natures?.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--color-neutral-400)]">Nenhuma natureza cadastrada</p>
        )}
      </div>

      <NatureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nature={editItem}
      />
    </div>
  );
}
