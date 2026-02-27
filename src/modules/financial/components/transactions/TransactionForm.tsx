import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths } from 'date-fns';
import { FormField } from '@/shared/components/form/FormField';
import { Input } from '@/shared/components/form/Input';
import { Textarea } from '@/shared/components/form/Textarea';
import { Button } from '@/shared/components/form/Button';
import { CurrencyInput } from '@/shared/components/form/CurrencyInput';
import {
  useTransaction,
  useTransactionMutations,
  useCategories,
  useNatures,
  useFundingSources,
  useBankAccounts,
} from '@/modules/financial/hooks/useFinancial';
import type { Transaction, CreateTransactionInput } from '@/modules/financial/types/financial.types';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const transacaoSchema = z.object({
  tipo: z.enum(['expense', 'revenue']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().positive('Valor deve ser positivo'),
  data: z.string().min(1, 'Data é obrigatória'),
  data_vencimento: z.string().optional(),
  situacao: z.enum(['pending', 'paid']),
  forma_pagamento: z.string().optional(),
  tipo_comprovante: z.string().optional(),
  categoria_id: z.string().optional(),
  natureza_id: z.string().optional(),
  fonte_recurso_id: z.string().optional(),
  conta_bancaria_id: z.string().optional(),
  observacoes: z.string().optional(),
});

export type TransacaoFormData = z.infer<typeof transacaoSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TransactionFormProps {
  mode: 'create' | 'edit' | 'copy';
  defaultValues?: Partial<CreateTransactionInput>;
  transactionId?: string;
  onSuccess?: (transaction: Transaction) => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FORMAS_PAGAMENTO = [
  { value: 'pix', label: 'PIX' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'check', label: 'Cheque' },
];

const TIPOS_COMPROVANTE = [
  { value: 'nota_fiscal', label: 'Nota Fiscal' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'cupom_fiscal', label: 'Cupom Fiscal' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'outros', label: 'Outros' },
];

function prepareDefaults(
  mode: 'create' | 'edit' | 'copy',
  source?: Partial<CreateTransactionInput>,
): TransacaoFormData {
  const base: TransacaoFormData = {
    tipo: 'expense',
    descricao: '',
    valor: 0,
    data: format(new Date(), 'yyyy-MM-dd'),
    situacao: 'pending',
  };

  if (!source) return base;

  const merged = { ...base, ...source };

  if (mode === 'copy') {
    // Avançar vencimento em +1 mês
    if (merged.data_vencimento) {
      try {
        const nextMonth = addMonths(new Date(merged.data_vencimento), 1);
        merged.data_vencimento = format(nextMonth, 'yyyy-MM-dd');
      } catch {
        // manter original se parsing falhar
      }
    }
    // Nova data de competência = hoje
    merged.data = format(new Date(), 'yyyy-MM-dd');
    // Resetar status para pendente
    merged.situacao = 'pending';
  }

  return merged as TransacaoFormData;
}

// Limpar campos opcionais vazios antes de enviar
function cleanInput(data: TransacaoFormData): CreateTransactionInput {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== '' && value !== undefined && value !== null) {
      clean[key] = value;
    }
  }
  return clean as unknown as CreateTransactionInput;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionForm({
  mode,
  defaultValues,
  transactionId,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { data: editTransaction } = useTransaction(mode === 'edit' && transactionId ? transactionId : '');
  const { create, update } = useTransactionMutations();
  const { data: categories } = useCategories();
  const { data: natures } = useNatures();
  const { data: fundingSources } = useFundingSources();
  const { data: bankAccounts } = useBankAccounts();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
    defaultValues: prepareDefaults(mode, defaultValues),
  });

  // Preencher form no modo edit quando dados carregarem
  useEffect(() => {
    if (mode === 'edit' && editTransaction) {
      reset({
        tipo: editTransaction.tipo,
        descricao: editTransaction.descricao,
        valor: editTransaction.valor,
        data: editTransaction.data,
        data_vencimento: editTransaction.data_vencimento ?? undefined,
        situacao: editTransaction.situacao === 'overdue' ? 'pending' : (editTransaction.situacao as 'pending' | 'paid'),
        forma_pagamento: editTransaction.forma_pagamento ?? undefined,
        tipo_comprovante: editTransaction.tipo_comprovante ?? undefined,
        categoria_id: editTransaction.categoria_id ?? undefined,
        natureza_id: editTransaction.natureza_id ?? undefined,
        fonte_recurso_id: editTransaction.fonte_recurso_id ?? undefined,
        conta_bancaria_id: editTransaction.conta_bancaria_id ?? undefined,
        observacoes: editTransaction.observacoes ?? undefined,
      });
    }
  }, [mode, editTransaction, reset]);

  // Preencher form no modo copy quando defaultValues mudar
  useEffect(() => {
    if (mode === 'copy' && defaultValues) {
      reset(prepareDefaults('copy', defaultValues));
    }
  }, [mode, defaultValues, reset]);

  const watchType = watch('tipo');
  const isSubmitting = create.isPending || update.isPending;

  const onSubmit = (data: TransacaoFormData) => {
    const input = cleanInput(data);

    if (mode === 'edit' && transactionId) {
      update.mutate(
        { id: transactionId, input },
        { onSuccess: (t) => onSuccess?.(t) },
      );
    } else {
      create.mutate(input, { onSuccess: (t) => onSuccess?.(t) });
    }
  };

  const selectClasses = 'flex h-10 w-full appearance-none rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Tipo */}
      <FormField label="Tipo" required>
        <select {...register('tipo')} className={selectClasses}>
          <option value="expense">Despesa</option>
          <option value="revenue">Receita</option>
        </select>
      </FormField>

      {/* Descrição */}
      <FormField label="Descrição" required error={errors.descricao?.message}>
        <Input
          {...register('descricao')}
          placeholder="Descrição da transação"
          error={!!errors.descricao}
        />
      </FormField>

      {/* Valor e Data */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Valor (R$)" required error={errors.valor?.message}>
          <Controller
            name="valor"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                value={field.value}
                onChange={field.onChange}
                error={!!errors.valor}
                placeholder="0,00"
              />
            )}
          />
        </FormField>
        <FormField label="Data" required error={errors.data?.message}>
          <Input type="date" {...register('data')} error={!!errors.data} />
        </FormField>
      </div>

      {/* Vencimento e Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Vencimento">
          <Input type="date" {...register('data_vencimento')} />
        </FormField>
        <FormField label="Status">
          <select {...register('situacao')} className={selectClasses}>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </FormField>
      </div>

      {/* Categoria e Natureza */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Categoria">
          <select {...register('categoria_id')} className={selectClasses}>
            <option value="">Selecione</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </FormField>
        <FormField label={watchType === 'expense' ? 'Natureza de Despesa' : 'Natureza'}>
          <select {...register('natureza_id')} className={selectClasses}>
            <option value="">Selecione</option>
            {natures?.map((n) => (
              <option key={n.id} value={n.id}>{n.nome}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Fonte de Recurso e Conta Bancária */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Fonte de Recurso">
          <select {...register('fonte_recurso_id')} className={selectClasses}>
            <option value="">Selecione</option>
            {fundingSources?.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Conta Bancária">
          <select {...register('conta_bancaria_id')} className={selectClasses}>
            <option value="">Selecione</option>
            {bankAccounts?.map((b) => (
              <option key={b.id} value={b.id}>{b.nome_banco}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Forma de Pagamento e Tipo Comprovante */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Forma de Pagamento">
          <select {...register('forma_pagamento')} className={selectClasses}>
            <option value="">Selecione</option>
            {FORMAS_PAGAMENTO.map((fp) => (
              <option key={fp.value} value={fp.value}>{fp.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Tipo de Comprovante">
          <select {...register('tipo_comprovante')} className={selectClasses}>
            <option value="">Selecione</option>
            {TIPOS_COMPROVANTE.map((tc) => (
              <option key={tc.value} value={tc.value}>{tc.label}</option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Observações */}
      <FormField label="Observações">
        <Textarea
          {...register('observacoes')}
          rows={3}
          placeholder="Observações adicionais"
        />
      </FormField>

      {/* Botões */}
      <div className="flex justify-end gap-3 border-t border-[var(--color-neutral-100)] pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {mode === 'edit' ? 'Salvar Alterações' : mode === 'copy' ? 'Criar Cópia' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
