'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { useBankAccountMutations } from '../../hooks/useFinancialSettings';
import type { BankAccount } from '@/modules/financial/types/financial.types';

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: BankAccount | null;
}

export function BankAccountDialog({ open, onOpenChange, account }: BankAccountDialogProps) {
  const isEditing = !!account;
  const [nomeBanco, setNomeBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [numeroConta, setNumeroConta] = useState('');
  const [tipoConta, setTipoConta] = useState('checking');
  const [titular, setTitular] = useState('');
  const [descricao, setDescricao] = useState('');

  const { create, update } = useBankAccountMutations();
  const isLoading = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setNomeBanco(account?.nome_banco ?? '');
      setAgencia(account?.agencia ?? '');
      setNumeroConta(account?.numero_conta ?? '');
      setTipoConta(account?.tipo_conta ?? 'checking');
      setTitular(account?.titular ?? '');
      setDescricao(account?.descricao ?? '');
    }
  }, [open, account]);

  function handleSubmit() {
    if (!nomeBanco.trim()) return;

    const input = {
      nome_banco: nomeBanco.trim(),
      agencia: agencia.trim() || undefined,
      numero_conta: numeroConta.trim() || undefined,
      tipo_conta: tipoConta,
      titular: titular.trim() || undefined,
      descricao: descricao.trim() || undefined,
    };

    if (isEditing) {
      update.mutate(
        { id: account!.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setNomeBanco('');
      setAgencia('');
      setNumeroConta('');
      setTipoConta('checking');
      setTitular('');
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
            {isEditing ? 'Editar conta bancária' : 'Nova conta bancária'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {isEditing ? 'Altere os dados da conta.' : 'Preencha os dados para cadastrar uma conta bancária.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ba-banco" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Banco *
                </label>
                <input
                  id="ba-banco"
                  type="text"
                  value={nomeBanco}
                  onChange={(e) => setNomeBanco(e.target.value)}
                  placeholder="Nome do banco"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label htmlFor="ba-tipo" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Tipo
                </label>
                <select
                  id="ba-tipo"
                  value={tipoConta}
                  onChange={(e) => setTipoConta(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="checking">Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ba-agencia" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Agência
                </label>
                <input
                  id="ba-agencia"
                  type="text"
                  value={agencia}
                  onChange={(e) => setAgencia(e.target.value)}
                  placeholder="0000"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label htmlFor="ba-conta" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Conta
                </label>
                <input
                  id="ba-conta"
                  type="text"
                  value={numeroConta}
                  onChange={(e) => setNumeroConta(e.target.value)}
                  placeholder="00000-0"
                  className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ba-titular" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Titular
              </label>
              <input
                id="ba-titular"
                type="text"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                placeholder="Nome do titular"
                className="h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label htmlFor="ba-desc" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição
              </label>
              <textarea
                id="ba-desc"
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
            <Button onClick={handleSubmit} loading={isLoading} disabled={!nomeBanco.trim()}>
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
