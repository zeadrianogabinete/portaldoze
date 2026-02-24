import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Calendar, DollarSign, FileText, CreditCard, Trash2 } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useTransaction, useTransactionMutations } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/financial/$id')({
  component: TransacaoDetalhe,
});

function TransacaoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: transaction, isLoading } = useTransaction(id);
  const { remove, markAsPaid } = useTransactionMutations();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <LoadingPage />;
  if (!transaction) return null;

  const statusLabels: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Atrasado', cancelled: 'Cancelado' };
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-green-50 text-green-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
  };

  const paymentLabels: Record<string, string> = {
    pix: 'PIX', transfer: 'Transferência', boleto: 'Boleto', credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito', cash: 'Dinheiro', check: 'Cheque', other: 'Outro',
  };

  return (
    <PageContainer
      title={transaction.description}
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
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Status + Tipo */}
        <div className="flex items-center gap-3">
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusColors[transaction.status] ?? '')}>
            {statusLabels[transaction.status] ?? transaction.status}
          </span>
          <span className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            transaction.type === 'expense' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700',
          )}>
            {transaction.type === 'expense' ? 'Despesa' : 'Receita'}
          </span>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-[var(--color-neutral-400)]">#{transaction.transaction_number}</span>
            <span className={cn(
              'font-heading text-2xl font-bold',
              transaction.type === 'expense' ? 'text-red-600' : 'text-green-600',
            )}>
              {transaction.type === 'expense' ? '- ' : '+ '}{formatCurrency(transaction.amount)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <Calendar size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
              <span>Data: {formatDate(transaction.date)}</span>
            </div>
            {transaction.due_date && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                <Calendar size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
                <span>Vencimento: {formatDate(transaction.due_date)}</span>
              </div>
            )}
            {transaction.payment_method && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                <CreditCard size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
                <span>{paymentLabels[transaction.payment_method] ?? transaction.payment_method}</span>
              </div>
            )}
            {transaction.nature && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                <FileText size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
                <span>Natureza: {transaction.nature.name}</span>
              </div>
            )}
          </div>

          {transaction.notes && (
            <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Observações</h4>
              <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{transaction.notes}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {transaction.status === 'pending' && (
            <button
              type="button"
              onClick={() => markAsPaid.mutate(transaction.id)}
              disabled={markAsPaid.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              <DollarSign size={14} strokeWidth={1.5} />
              Marcar como Pago
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] transition-colors hover:bg-red-100"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            Excluir
          </button>
        </div>

        {/* Confirmação de exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)]">
            <div className="mx-4 max-w-md rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-lg)]">
              <h3 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">Excluir transação?</h3>
              <p className="mt-2 text-sm text-[var(--color-neutral-500)]">Esta ação não pode ser desfeita.</p>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-neutral-700)]">Cancelar</button>
                <button
                  type="button"
                  onClick={() => remove.mutate(transaction.id, { onSuccess: () => navigate({ to: '/financial' }) })}
                  disabled={remove.isPending}
                  className="rounded-lg bg-[var(--color-error)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {remove.isPending ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
