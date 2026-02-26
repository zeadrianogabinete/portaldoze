import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Link2,
  Plus,
  Send,
  Trash2,
  Unlink,
} from 'lucide-react';
import { format } from 'date-fns';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/form/Button';
import { ConfirmDialog } from '@/shared/components/form/ConfirmDialog';
import {
  useReimbursementReport,
  useReportTransactions,
  useReportMutations,
} from '@/modules/financial/hooks/useFinancial';
import { SelectTransactionsDialog } from '@/modules/financial/components/reports/SelectTransactionsDialog';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/financial/reports/$id')({
  component: ReportDetail,
});

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  received: 'Recebido',
};

const statusColors: Record<string, string> = {
  draft: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
  sent: 'bg-blue-50 text-blue-700',
  received: 'bg-green-50 text-green-700',
};

function ReportDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: report, isLoading } = useReimbursementReport(id);
  const { data: transactions, isLoading: isLoadingTransactions } = useReportTransactions(id);
  const { update, remove, unlink } = useReportMutations();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSelectTransactions, setShowSelectTransactions] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; descricao: string } | null>(null);

  if (isLoading) return <LoadingPage />;
  if (!report) return null;

  const totalLinked = transactions?.reduce((sum, t) => sum + t.valor, 0) ?? 0;

  function handleMarkAsSent() {
    update.mutate({
      id: report!.id,
      input: {
        situacao: 'sent',
        enviado_em: format(new Date(), 'yyyy-MM-dd'),
      },
    });
  }

  function handleMarkAsReceived() {
    update.mutate({
      id: report!.id,
      input: {
        situacao: 'received',
        recebido_em: format(new Date(), 'yyyy-MM-dd'),
        valor_recebido: totalLinked,
      },
    });
  }

  return (
    <PageContainer
      title={report.nome}
      actions={
        <Link
          to="/financial/reports"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header com status e valor */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusColors[report.situacao] ?? '')}>
              {statusLabels[report.situacao] ?? report.situacao}
            </span>
          </div>
          <span className="font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
            {formatCurrency(report.valor_total ?? totalLinked)}
          </span>
        </div>

        {/* Card de informações */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-[var(--color-neutral-500)]">Período</p>
              <p className="mt-0.5 text-sm text-[var(--color-neutral-800)]">
                {formatDate(report.periodo_inicio)} — {formatDate(report.periodo_fim)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-neutral-500)]">Transações</p>
              <p className="mt-0.5 text-sm text-[var(--color-neutral-800)]">
                {report.total_movimentacoes ?? transactions?.length ?? 0} lançamento(s)
              </p>
            </div>
            {report.enviado_em && (
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Enviado em</p>
                <p className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{formatDate(report.enviado_em)}</p>
              </div>
            )}
            {report.recebido_em && (
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Recebido em</p>
                <p className="mt-0.5 text-sm text-[var(--color-neutral-800)]">{formatDate(report.recebido_em)}</p>
              </div>
            )}
            {report.valor_recebido != null && (
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Valor Recebido</p>
                <p className="mt-0.5 text-sm font-semibold text-green-600">{formatCurrency(report.valor_recebido)}</p>
              </div>
            )}
          </div>

          {report.observacoes && (
            <>
              <div className="my-4 border-t border-[var(--color-neutral-100)]" />
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-500)]">Observações</p>
                <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{report.observacoes}</p>
              </div>
            </>
          )}

          {/* Metadados */}
          <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-4">
            <div className="flex flex-wrap gap-4 text-xs text-[var(--color-neutral-400)]">
              {report.criado_em && <span>Criado em {formatDate(report.criado_em)}</span>}
              {report.atualizado_em && <span>Atualizado em {formatDate(report.atualizado_em)}</span>}
            </div>
          </div>
        </div>

        {/* Progressão de status */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-700)]">Fluxo do Relatório</h3>
          <div className="flex items-center gap-2">
            {/* Step 1: Rascunho */}
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
              'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
            )}>
              <FileText size={14} />
              Rascunho
            </div>
            <div className={cn('h-0.5 flex-1', report.situacao !== 'draft' ? 'bg-blue-500' : 'bg-[var(--color-neutral-200)]')} />

            {/* Step 2: Enviado */}
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
              report.situacao === 'sent' || report.situacao === 'received'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)]',
            )}>
              <Send size={14} />
              Enviado
            </div>
            <div className={cn('h-0.5 flex-1', report.situacao === 'received' ? 'bg-green-500' : 'bg-[var(--color-neutral-200)]')} />

            {/* Step 3: Recebido */}
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
              report.situacao === 'received'
                ? 'bg-green-50 text-green-700'
                : 'bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)]',
            )}>
              <CheckCircle size={14} />
              Recebido
            </div>
          </div>
        </div>

        {/* Transações vinculadas */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--color-neutral-100)] px-6 py-4">
            <div className="flex items-center gap-2">
              <Link2 size={16} strokeWidth={1.5} className="text-[var(--color-neutral-500)]" />
              <h3 className="text-sm font-semibold text-[var(--color-neutral-700)]">
                Transações Vinculadas
              </h3>
              <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-0.5 text-xs font-medium text-[var(--color-neutral-500)]">
                {transactions?.length ?? 0}
              </span>
            </div>
            {report.situacao === 'draft' && (
              <Button variant="secondary" onClick={() => setShowSelectTransactions(true)}>
                <Plus size={14} strokeWidth={1.5} />
                Vincular Transações
              </Button>
            )}
          </div>

          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[var(--color-neutral-400)]">
              Nenhuma transação vinculada a este relatório
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]/70">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Data</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Descrição</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Natureza</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Valor</th>
                      {report.situacao === 'draft' && (
                        <th className="w-10 px-2 py-2.5" />
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-neutral-100)]">
                    {transactions.map((t) => (
                      <tr key={t.id} className="transition-colors hover:bg-[var(--color-neutral-50)]">
                        <td className="px-4 py-3 text-sm text-[var(--color-neutral-600)]">{formatDate(t.data)}</td>
                        <td className="px-4 py-3">
                          <Link
                            to="/financial/$id"
                            params={{ id: t.id }}
                            className="text-sm font-medium text-[var(--color-neutral-800)] hover:text-primary-600 hover:underline"
                          >
                            {t.descricao}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-neutral-500)]">{t.natureza?.nome ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">{formatCurrency(t.valor)}</td>
                        {report.situacao === 'draft' && (
                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-[var(--color-neutral-400)] hover:bg-red-50 hover:text-red-500"
                              title="Desvincular"
                              onClick={() => setUnlinkTarget({ id: t.id, descricao: t.descricao })}
                            >
                              <Unlink size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-[var(--color-neutral-700)]">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[var(--color-neutral-800)]">{formatCurrency(totalLinked)}</td>
                      {report.situacao === 'draft' && <td />}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-0 divide-y divide-[var(--color-neutral-100)] sm:hidden">
                {transactions.map((t) => (
                  <div key={t.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/financial/$id"
                          params={{ id: t.id }}
                          className="text-sm font-medium text-[var(--color-neutral-800)] hover:text-primary-600"
                        >
                          {t.descricao}
                        </Link>
                        <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                          {formatDate(t.data)} {t.natureza?.nome ? `· ${t.natureza.nome}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(t.valor)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-[var(--color-neutral-50)] px-4 py-3">
                  <span className="text-sm font-semibold text-[var(--color-neutral-700)]">Total</span>
                  <span className="text-sm font-bold text-[var(--color-neutral-800)]">{formatCurrency(totalLinked)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {report.situacao === 'draft' && (
            <Button onClick={handleMarkAsSent} loading={update.isPending}>
              <Send size={14} strokeWidth={1.5} />
              Marcar como Enviado
            </Button>
          )}
          {report.situacao === 'sent' && (
            <Button onClick={handleMarkAsReceived} loading={update.isPending}>
              <CheckCircle size={14} strokeWidth={1.5} />
              Marcar como Recebido
            </Button>
          )}
          {report.situacao === 'draft' && (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} strokeWidth={1.5} />
              Excluir
            </Button>
          )}
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          title="Excluir relatório?"
          description="As transações vinculadas serão desvinculadas, mas não excluídas. Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          variant="danger"
          loading={remove.isPending}
          onConfirm={() => {
            remove.mutate(report.id, {
              onSuccess: () => navigate({ to: '/financial/reports' }),
            });
          }}
        />

        <ConfirmDialog
          open={!!unlinkTarget}
          onOpenChange={(v) => { if (!v) setUnlinkTarget(null); }}
          title="Desvincular transação?"
          description={`Remover "${unlinkTarget?.descricao}" deste relatório?`}
          confirmLabel="Desvincular"
          variant="danger"
          loading={unlink.isPending}
          onConfirm={() => {
            if (unlinkTarget) {
              unlink.mutate(
                { transactionId: unlinkTarget.id, reportId: report.id },
                { onSuccess: () => setUnlinkTarget(null) },
              );
            }
          }}
        />

        <SelectTransactionsDialog
          open={showSelectTransactions}
          onOpenChange={setShowSelectTransactions}
          reportId={report.id}
          periodoInicio={report.periodo_inicio}
          periodoFim={report.periodo_fim}
          onSuccess={() => setShowSelectTransactions(false)}
        />
      </div>
    </PageContainer>
  );
}
