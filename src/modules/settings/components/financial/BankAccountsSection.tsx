'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { Switch } from '@/shared/components/form/Switch';
import { cn } from '@/shared/utils/cn';
import { useSettingsBankAccounts, useBankAccountMutations } from '../../hooks/useFinancialSettings';
import { BankAccountDialog } from './BankAccountDialog';
import type { BankAccount } from '@/modules/financial/types/financial.types';

const TIPO_CONTA_LABEL: Record<string, string> = {
  checking: 'Corrente',
  savings: 'Poupança',
};

export function BankAccountsSection() {
  const { data: accounts } = useSettingsBankAccounts();
  const { update } = useBankAccountMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<BankAccount | null>(null);

  function openCreate() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function openEdit(item: BankAccount) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function formatAccountInfo(account: BankAccount): string {
    const parts: string[] = [];
    if (account.agencia) parts.push(`Ag: ${account.agencia}`);
    if (account.numero_conta) parts.push(`Conta: ${account.numero_conta}`);
    if (account.tipo_conta) parts.push(TIPO_CONTA_LABEL[account.tipo_conta] ?? account.tipo_conta);
    return parts.join(' | ');
  }

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
          Contas Bancárias ({accounts?.length ?? 0})
        </h3>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-2">
        {accounts?.map((a) => (
          <div
            key={a.id}
            className={cn(
              'flex items-center justify-between rounded-xl border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2',
              !a.ativo && 'opacity-60',
            )}
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-neutral-800)]">{a.nome_banco}</p>
              {formatAccountInfo(a) && (
                <p className="text-xs text-[var(--color-neutral-500)]">{formatAccountInfo(a)}</p>
              )}
              {a.titular && (
                <p className="text-xs text-[var(--color-neutral-500)]">Titular: {a.titular}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={a.ativo}
                onCheckedChange={(v) => update.mutate({ id: a.id, input: { ativo: v } })}
              />
              <button
                type="button"
                onClick={() => openEdit(a)}
                className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
        {accounts?.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--color-neutral-400)]">Nenhuma conta bancária cadastrada</p>
        )}
      </div>

      <BankAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editItem}
      />
    </div>
  );
}
