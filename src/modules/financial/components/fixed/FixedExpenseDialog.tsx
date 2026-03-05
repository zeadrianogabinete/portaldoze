'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/form/Button';
import { CurrencyInput } from '@/shared/components/form/CurrencyInput';
import { Switch } from '@/shared/components/form/Switch';
import { useNatures, useFundingSources, useBankAccounts, useFixedExpenseMutations } from '@/modules/financial/hooks/useFinancial';
import type { FixedExpense } from '@/modules/financial/types/financial.types';

interface FixedExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: FixedExpense | null;
}

const formasPagamento = [
  { value: 'pix', label: 'PIX' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'card', label: 'Cartão' },
];

export function FixedExpenseDialog({ open, onOpenChange, expense }: FixedExpenseDialogProps) {
  const isEditing = !!expense;

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);
  const [naturezaId, setNaturezaId] = useState('');
  const [fonteRecursoId, setFonteRecursoId] = useState('');
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [observacoes, setObservacoes] = useState('');

  const { data: natures } = useNatures();
  const { data: fundingSources } = useFundingSources();
  const { data: bankAccounts } = useBankAccounts();
  const { create, update } = useFixedExpenseMutations();
  const isLoading = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setDescricao(expense?.descricao ?? '');
      setValor(expense?.valor ?? 0);
      setNaturezaId(expense?.natureza_id ?? '');
      setFonteRecursoId(expense?.fonte_recurso_id ?? '');
      setContaBancariaId(expense?.conta_bancaria_id ?? '');
      setFormaPagamento(expense?.forma_pagamento ?? '');
      setDiaVencimento(expense?.dia_vencimento?.toString() ?? '');
      setContatoNome(expense?.contato_nome ?? '');
      setContatoTelefone(expense?.contato_telefone ?? '');
      setContatoEmail(expense?.contato_email ?? '');
      setAtivo(expense?.ativo ?? true);
      setObservacoes(expense?.observacoes ?? '');
    }
  }, [open, expense]);

  function handleSubmit() {
    if (!descricao.trim() || valor <= 0) return;

    const input = {
      descricao: descricao.trim(),
      valor,
      natureza_id: naturezaId || null,
      fonte_recurso_id: fonteRecursoId || null,
      conta_bancaria_id: contaBancariaId || null,
      forma_pagamento: (formaPagamento || null) as FixedExpense['forma_pagamento'],
      dia_vencimento: diaVencimento ? parseInt(diaVencimento, 10) : null,
      contato_nome: contatoNome.trim(),
      contato_telefone: contatoTelefone.trim() || null,
      contato_email: contatoEmail.trim() || null,
      contato_dados_pagamento: null,
      contato_id: expense?.contato_id ?? null,
      parcelado: expense?.parcelado ?? false,
      total_parcelas: expense?.total_parcelas ?? null,
      data_inicio: expense?.data_inicio ?? null,
      ativo,
      observacoes: observacoes.trim() || null,
    };

    if (isEditing) {
      update.mutate(
        { id: expense!.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setDescricao('');
      setValor(0);
      setNaturezaId('');
      setFonteRecursoId('');
      setContaBancariaId('');
      setFormaPagamento('');
      setDiaVencimento('');
      setContatoNome('');
      setContatoTelefone('');
      setContatoEmail('');
      setAtivo(true);
      setObservacoes('');
    }
    onOpenChange(value);
  }

  const inputClass = 'h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-lg">
          <Dialog.Title className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
            {isEditing ? 'Editar despesa fixa' : 'Nova despesa fixa'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-neutral-500)]">
            {isEditing ? 'Altere os dados da despesa fixa.' : 'Preencha os dados para criar uma nova despesa fixa.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            {/* Descrição */}
            <div>
              <label htmlFor="fe-descricao" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Descrição *
              </label>
              <input
                id="fe-descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Aluguel escritório"
                className={inputClass}
              />
            </div>

            {/* Valor + Dia Vencimento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fe-valor" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Valor *
                </label>
                <CurrencyInput value={valor} onChange={setValor} placeholder="R$ 0,00" />
              </div>
              <div>
                <label htmlFor="fe-dia" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Dia de vencimento
                </label>
                <input
                  id="fe-dia"
                  type="number"
                  min={1}
                  max={31}
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  placeholder="1-31"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Natureza + Fonte */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fe-natureza" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Natureza
                </label>
                <select
                  id="fe-natureza"
                  value={naturezaId}
                  onChange={(e) => setNaturezaId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Nenhuma</option>
                  {natures?.map((n) => (
                    <option key={n.id} value={n.id}>{n.codigo} — {n.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fe-fonte" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Fonte de recurso
                </label>
                <select
                  id="fe-fonte"
                  value={fonteRecursoId}
                  onChange={(e) => setFonteRecursoId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Nenhuma</option>
                  {fundingSources?.filter((f) => f.tipo === 'expense').map((f) => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conta Bancária + Forma de Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fe-conta" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Conta bancária
                </label>
                <select
                  id="fe-conta"
                  value={contaBancariaId}
                  onChange={(e) => setContaBancariaId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Nenhuma</option>
                  {bankAccounts?.map((b) => (
                    <option key={b.id} value={b.id}>{b.nome_banco}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fe-pagamento" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Forma de pagamento
                </label>
                <select
                  id="fe-pagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Nenhuma</option>
                  {formasPagamento.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contato */}
            <div>
              <label htmlFor="fe-contato" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Nome do contato
              </label>
              <input
                id="fe-contato"
                type="text"
                value={contatoNome}
                onChange={(e) => setContatoNome(e.target.value)}
                placeholder="Nome do fornecedor/contato"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="fe-telefone" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  Telefone
                </label>
                <input
                  id="fe-telefone"
                  type="text"
                  value={contatoTelefone}
                  onChange={(e) => setContatoTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fe-email" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                  E-mail
                </label>
                <input
                  id="fe-email"
                  type="email"
                  value={contatoEmail}
                  onChange={(e) => setContatoEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="fe-obs" className="mb-1 block text-sm font-medium text-[var(--color-neutral-700)]">
                Observações
              </label>
              <textarea
                id="fe-obs"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações opcionais"
                rows={2}
                className="w-full rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-800)] outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Status ativo */}
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2.5">
              <span className="text-sm font-medium text-[var(--color-neutral-700)]">Ativa</span>
              <Switch checked={ativo} onCheckedChange={setAtivo} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={isLoading} disabled={!descricao.trim() || valor <= 0}>
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
