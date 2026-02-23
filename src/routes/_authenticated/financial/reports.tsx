import { createFileRoute } from '@tanstack/react-router';
import { FileText } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useReimbursementReports } from '@/modules/financial/hooks/useFinancial';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/financial/reports')({
  component: Relatorios,
});

function Relatorios() {
  const { data: reports, isLoading } = useReimbursementReports();

  const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Enviado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
    submitted: 'bg-blue-50 text-blue-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  };

  return (
    <PageContainer title="Relatórios" subtitle="Relatórios de reembolso e prestação de contas">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon={<FileText size={40} strokeWidth={1.5} />}
          title="Nenhum relatório"
          description="Ainda não há relatórios de reembolso"
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                  Relatório {report.month}
                </p>
                {report.submitted_at && (
                  <p className="mt-0.5 text-xs text-[var(--color-neutral-500)]">
                    Enviado em {formatDate(report.submitted_at)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                  {formatCurrency(report.total_amount)}
                </span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[report.status] ?? '')}>
                  {statusLabels[report.status] ?? report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
