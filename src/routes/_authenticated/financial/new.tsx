import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransactionMutations, useCategories, useNatures, useFundingSources } from '@/modules/financial/hooks/useFinancial';
import { format } from 'date-fns';

const transactionSchema = z.object({
  type: z.enum(['expense', 'revenue']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  due_date: z.string().optional(),
  status: z.enum(['pending', 'paid']),
  payment_method: z.string().optional(),
  receipt_type: z.string().optional(),
  receipt_number: z.string().optional(),
  category_id: z.string().optional(),
  nature_id: z.string().optional(),
  funding_source_id: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export const Route = createFileRoute('/_authenticated/financial/new')({
  component: NovaTransacao,
});

function NovaTransacao() {
  const navigate = useNavigate();
  const { create } = useTransactionMutations();
  const { data: categories } = useCategories();
  const { data: natures } = useNatures();
  const { data: fundingSources } = useFundingSources();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
    },
  });

  const watchType = watch('type');

  const onSubmit = (data: TransactionFormData) => {
    create.mutate(data, {
      onSuccess: () => {
        navigate({ to: watchType === 'expense' ? '/financial/expenses' : '/financial/revenues' });
      },
    });
  };

  const inputClasses = 'flex h-10 w-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500';
  const selectClasses = 'flex h-10 w-full appearance-none rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500';
  const labelClasses = 'text-sm font-medium text-[var(--color-neutral-700)]';

  return (
    <PageContainer
      title="Nova Transação"
      actions={
        <Link
          to="/financial"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]"
      >
        {/* Tipo */}
        <div className="space-y-1.5">
          <label className={labelClasses}>Tipo</label>
          <select {...register('type')} className={selectClasses}>
            <option value="expense">Despesa</option>
            <option value="revenue">Receita</option>
          </select>
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className={labelClasses}>
            Descrição <span className="text-[var(--color-error)]">*</span>
          </label>
          <input {...register('description')} className={inputClasses} placeholder="Descrição da transação" />
          {errors.description && <p className="text-xs text-[var(--color-error)]">{errors.description.message}</p>}
        </div>

        {/* Valor e Data */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClasses}>
              Valor (R$) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className={inputClasses} placeholder="0,00" />
            {errors.amount && <p className="text-xs text-[var(--color-error)]">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>
              Data <span className="text-[var(--color-error)]">*</span>
            </label>
            <input type="date" {...register('date')} className={inputClasses} />
            {errors.date && <p className="text-xs text-[var(--color-error)]">{errors.date.message}</p>}
          </div>
        </div>

        {/* Vencimento e Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClasses}>Vencimento</label>
            <input type="date" {...register('due_date')} className={inputClasses} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Status</label>
            <select {...register('status')} className={selectClasses}>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
            </select>
          </div>
        </div>

        {/* Categoria e Natureza */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClasses}>Categoria</label>
            <select {...register('category_id')} className={selectClasses}>
              <option value="">Selecione</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Natureza de Despesa</label>
            <select {...register('nature_id')} className={selectClasses}>
              <option value="">Selecione</option>
              {natures?.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fonte de Recurso e Forma de Pagamento */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClasses}>Fonte de Recurso</label>
            <select {...register('funding_source_id')} className={selectClasses}>
              <option value="">Selecione</option>
              {fundingSources?.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Forma de Pagamento</label>
            <select {...register('payment_method')} className={selectClasses}>
              <option value="">Selecione</option>
              <option value="pix">PIX</option>
              <option value="transfer">Transferência</option>
              <option value="boleto">Boleto</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="cash">Dinheiro</option>
              <option value="check">Cheque</option>
            </select>
          </div>
        </div>

        {/* Documento */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClasses}>Tipo de Documento</label>
            <select {...register('receipt_type')} className={selectClasses}>
              <option value="">Selecione</option>
              <option value="nota_fiscal">Nota Fiscal</option>
              <option value="recibo">Recibo</option>
              <option value="cupom_fiscal">Cupom Fiscal</option>
              <option value="contrato">Contrato</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClasses}>Número do Documento</label>
            <input {...register('receipt_number')} className={inputClasses} placeholder="Nº do documento" />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <label className={labelClasses}>Observações</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="flex min-h-[60px] w-full rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Observações adicionais"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 border-t border-[var(--color-neutral-100)] pt-4">
          <Link
            to="/financial"
            className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {create.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
