'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { Switch } from '@/shared/components/form/Switch';
import { cn } from '@/shared/utils/cn';
import { useSettingsFundingSources, useFundingSourceMutations } from '../../hooks/useFinancialSettings';
import { FundingSourceDialog } from './FundingSourceDialog';
import type { FundingSource } from '@/modules/financial/types/financial.types';

const TIPO_LABEL: Record<string, string> = {
  expense: 'Despesa',
  revenue: 'Receita',
};

const TIPO_STYLE: Record<string, string> = {
  expense: 'bg-orange-50 text-orange-700',
  revenue: 'bg-emerald-50 text-emerald-700',
};

export function FundingSourcesSection() {
  const { data: sources } = useSettingsFundingSources();
  const { update } = useFundingSourceMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FundingSource | null>(null);

  function openCreate() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: FundingSource) {
    setEditItem(item);
    setDialogOpen(true);
  }

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
          Fontes de Recurso ({sources?.length ?? 0})
        </h3>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {sources?.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2',
              !s.ativo && 'opacity-60',
            )}
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">{s.nome}</p>
              {s.codigo && (
                <p className="text-xs text-[var(--color-neutral-500)]">Código: {s.codigo}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', TIPO_STYLE[s.tipo] ?? '')}>
                {TIPO_LABEL[s.tipo] ?? s.tipo}
              </span>
              <Switch
                checked={s.ativo}
                onCheckedChange={(v) => update.mutate({ id: s.id, input: { ativo: v } })}
              />
              <button
                type="button"
                onClick={() => openEdit(s)}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
        {sources?.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--color-neutral-400)]">Nenhuma fonte cadastrada</p>
        )}
      </div>

      <FundingSourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source={editItem}
      />
    </div>
  );
}
