import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { TransactionForm } from '@/modules/financial/components/transactions/TransactionForm';
import { useTransaction } from '@/modules/financial/hooks/useFinancial';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';

const searchSchema = z.object({
  copyFrom: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/financial/new')({
  validateSearch: searchSchema,
  component: NovaTransacao,
});

function NovaTransacao() {
  const navigate = useNavigate();
  const { copyFrom } = Route.useSearch();

  // Buscar transação fonte se estiver copiando
  const { data: sourceTransaction, isLoading: isLoadingSource } = useTransaction(copyFrom ?? '');

  // Aguardar carregamento da transação fonte
  if (copyFrom && isLoadingSource) return <LoadingPage />;

  const isCopy = !!copyFrom && !!sourceTransaction;

  // Preparar defaultValues para modo copy
  const copyDefaults = sourceTransaction
    ? {
        tipo: sourceTransaction.tipo,
        descricao: sourceTransaction.descricao,
        valor: sourceTransaction.valor,
        data: sourceTransaction.data,
        data_vencimento: sourceTransaction.data_vencimento ?? undefined,
        situacao: sourceTransaction.situacao as 'pending' | 'paid',
        forma_pagamento: sourceTransaction.forma_pagamento ?? undefined,
        tipo_comprovante: sourceTransaction.tipo_comprovante ?? undefined,
        categoria_id: sourceTransaction.categoria_id ?? undefined,
        natureza_id: sourceTransaction.natureza_id ?? undefined,
        fonte_recurso_id: sourceTransaction.fonte_recurso_id ?? undefined,
        conta_bancaria_id: sourceTransaction.conta_bancaria_id ?? undefined,
        observacoes: sourceTransaction.observacoes ?? undefined,
      }
    : undefined;

  return (
    <PageContainer
      title={isCopy ? 'Copiar Transação' : 'Nova Transação'}
      subtitle={isCopy ? `Baseado em: ${sourceTransaction.descricao}` : undefined}
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
      <div className="mx-auto max-w-2xl rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <TransactionForm
          mode={isCopy ? 'copy' : 'create'}
          defaultValues={copyDefaults}
          onSuccess={(t) =>
            navigate({ to: '/financial/$id', params: { id: t.id } })
          }
          onCancel={() => navigate({ to: '/financial' })}
        />
      </div>
    </PageContainer>
  );
}
