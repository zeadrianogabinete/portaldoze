import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FileText, Plus } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { Button } from '@/shared/components/form/Button';
import { useReimbursementReports } from '@/modules/financial/hooks/useFinancial';
import { CreateReportDialog } from '@/modules/financial/components/reports/CreateReportDialog';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/financial/reports')({
  component: Relatorios,
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

function Relatorios() {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useReimbursementReports();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <PageContainer
      title="Relatórios"
      subtitle="Relatórios de reembolso e prestação de contas"
      actions={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} strokeWidth={2} />
          Novo Relatório
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={<FileText size={40} strokeWidth={1.5} />}
          title="Nenhum relatório"
          description="Crie um relatório de reembolso para agrupar despesas CEAP"
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus size={16} strokeWidth={2} />
              Criar Primeiro Relatório
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="cursor-pointer rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-neutral-50)]"
              onClick={() => navigate({ to: '/financial/reports/$id', params: { id: report.id } })}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                    {report.nome}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                    {formatDate(report.periodo_inicio)} — {formatDate(report.periodo_fim)}
                    {report.total_movimentacoes != null && ` · ${report.total_movimentacoes} lançamento(s)`}
                  </p>
                  {report.enviado_em && (
                    <p className="mt-0.5 text-xs text-[var(--color-neutral-400)]">
                      Enviado em {formatDate(report.enviado_em)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                    {report.valor_total != null ? formatCurrency(report.valor_total) : '—'}
                  </span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[report.situacao] ?? '')}>
                    {statusLabels[report.situacao] ?? report.situacao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateReportDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => setShowCreateDialog(false)}
      />
    </PageContainer>
  );
}
