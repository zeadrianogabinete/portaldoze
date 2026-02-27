import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Copy,
  DollarSign,
  FileText,
  FolderOpen,
  Hash,
  Layers,
  Pencil,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/form/Button';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import { useTransaction, useTransactionMutations } from '@/modules/financial/hooks/useFinancial';
import { TransactionForm } from '@/modules/financial/components/transactions/TransactionForm';
import { PaymentConfirmDialog } from '@/modules/financial/components/transactions/PaymentConfirmDialog';
import { DocumentList } from '@/modules/financial/components/documents/DocumentList';
import { DocumentUpload } from '@/modules/financial/components/documents/DocumentUpload';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/financial/$id')({
  component: TransacaoDetalhe,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Atrasado',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  overdue: 'bg-red-50 text-red-700',
  cancelled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
};

const paymentLabels: Record<string, string> = {
  pix: 'PIX',
  transfer: 'Transferência',
  boleto: 'Boleto',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  check: 'Cheque',
  other: 'Outro',
};

const documentLabels: Record<string, string> = {
  nota_fiscal: 'Nota Fiscal',
  recibo: 'Recibo',
  cupom_fiscal: 'Cupom Fiscal',
  contrato: 'Contrato',
  outros: 'Outros',
};

// ---------------------------------------------------------------------------
// Detail row
// ---------------------------------------------------------------------------

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--color-neutral-400)]" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--color-neutral-500)]">{label}</p>
        <p className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{value}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

function TransacaoDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: transaction, isLoading } = useTransaction(id);
  const { remove } = useTransactionMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  if (isLoading) return <LoadingPage />;
  if (!transaction) return null;

  // === Modo Edição ===
  if (isEditing) {
    return (
      <PageContainer
        title="Editar Transação"
        actions={
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>
        }
      >
        <div className="mx-auto max-w-2xl rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <TransactionForm
            mode="edit"
            transactionId={id}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </PageContainer>
    );
  }

  // === Modo Visualização ===
  return (
    <PageContainer
      title={transaction.descricao}
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
        {/* Header: Badges + Valor */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusColors[transaction.situacao] ?? '')}>
              {statusLabels[transaction.situacao] ?? transaction.situacao}
            </span>
            <span className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              transaction.tipo === 'expense' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700',
            )}>
              {transaction.tipo === 'expense' ? 'Despesa' : 'Receita'}
            </span>
            <span className="text-xs text-[var(--color-neutral-400)]">#{transaction.numero}</span>
          </div>
          <span className={cn(
            'font-heading text-2xl font-bold',
            transaction.tipo === 'expense' ? 'text-red-600' : 'text-green-600',
          )}>
            {transaction.tipo === 'expense' ? '- ' : '+ '}{formatCurrency(transaction.valor)}
          </span>
        </div>

        {/* Card principal com detalhes */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          {/* Datas */}
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <DetailRow icon={Calendar} label="Data de Competência" value={formatDate(transaction.data)} />
            <DetailRow icon={Calendar} label="Vencimento" value={transaction.data_vencimento ? formatDate(transaction.data_vencimento) : null} />
            <DetailRow icon={Calendar} label="Data de Pagamento" value={transaction.pago_em ? formatDate(transaction.pago_em) : null} />
          </div>

          {/* Separador */}
          <div className="my-4 border-t border-[var(--color-neutral-100)]" />

          {/* Classificação */}
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <DetailRow icon={Tag} label="Natureza" value={transaction.natureza?.nome} />
            <DetailRow icon={Layers} label="Categoria" value={transaction.categoria?.nome} />
            <DetailRow icon={Wallet} label="Fonte de Recurso" value={transaction.fonte_recurso?.nome} />
            <DetailRow icon={Hash} label="Conta Bancária" value={transaction.conta_bancaria?.nome_banco ?? null} />
          </div>

          {/* Separador */}
          <div className="my-4 border-t border-[var(--color-neutral-100)]" />

          {/* Pagamento */}
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <DetailRow icon={CreditCard} label="Forma de Pagamento" value={transaction.forma_pagamento ? (paymentLabels[transaction.forma_pagamento] ?? transaction.forma_pagamento) : null} />
            <DetailRow icon={FileText} label="Tipo de Comprovante" value={transaction.tipo_comprovante ? (documentLabels[transaction.tipo_comprovante] ?? transaction.tipo_comprovante) : null} />
          </div>

          {/* Observações */}
          {transaction.observacoes && (
            <>
              <div className="my-4 border-t border-[var(--color-neutral-100)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Observações</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-neutral-700)]">{transaction.observacoes}</p>
              </div>
            </>
          )}

          {/* Metadados */}
          <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-4">
            <div className="flex flex-wrap gap-4 text-xs text-[var(--color-neutral-400)]">
              {transaction.criado_em && <span>Criado em {formatDate(transaction.criado_em)}</span>}
              {transaction.atualizado_em && <span>Atualizado em {formatDate(transaction.atualizado_em)}</span>}
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen size={16} strokeWidth={1.5} className="text-[var(--color-neutral-500)]" />
            <h3 className="text-sm font-semibold text-[var(--color-neutral-700)]">Documentos</h3>
          </div>
          <DocumentList movimentacaoId={transaction.id} editable />
          <div className="mt-4">
            <DocumentUpload movimentacaoId={transaction.id} />
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Pencil size={14} strokeWidth={1.5} />
            Editar
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate({ to: '/financial/new', search: { copyFrom: id } })}
          >
            <Copy size={14} strokeWidth={1.5} />
            Copiar
          </Button>
          {(transaction.situacao === 'pending' || transaction.situacao === 'overdue') && (
            <Button
              variant="secondary"
              onClick={() => setShowPaymentConfirm(true)}
              className="!bg-green-50 !text-green-700 hover:!bg-green-100"
            >
              <DollarSign size={14} strokeWidth={1.5} />
              Confirmar Pagamento
            </Button>
          )}
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} strokeWidth={1.5} />
            Excluir
          </Button>
        </div>

        {/* Dialog de exclusão */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Excluir transação?"
          description="Esta ação não pode ser desfeita. A transação será permanentemente removida."
          confirmLabel="Excluir"
          variant="danger"
          loading={remove.isPending}
          onConfirm={() => {
            remove.mutate(transaction.id, {
              onSuccess: () => navigate({ to: '/financial' }),
            });
          }}
        />

        {/* Dialog de confirmação de pagamento */}
        <PaymentConfirmDialog
          open={showPaymentConfirm}
          onOpenChange={setShowPaymentConfirm}
          transactionId={transaction.id}
          transactionDescricao={transaction.descricao}
          transactionValor={transaction.valor}
          onSuccess={() => setShowPaymentConfirm(false)}
        />
      </div>
    </PageContainer>
  );
}
