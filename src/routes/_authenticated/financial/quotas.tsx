import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useQuotaConfig, useQuotaUsage } from '@/modules/financial/hooks/useFinancial';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/financial/quotas')({
  component: CotasCEAP,
});

function CotasCEAP() {
  const now = new Date();
  const { data: quotaConfig } = useQuotaConfig();
  const { data: usage, isLoading } = useQuotaUsage(now.getFullYear(), now.getMonth() + 1);

  const monthlyLimit = quotaConfig?.monthly_limit ?? 45612.53;
  const totalUsed = usage?.reduce((sum: number, item: { total_used?: number }) => sum + (item.total_used ?? 0), 0) ?? 0;
  const remaining = monthlyLimit - totalUsed;
  const percentage = monthlyLimit > 0 ? (totalUsed / monthlyLimit) * 100 : 0;

  return (
    <PageContainer title="Cota CEAP" subtitle="Cota para Exercício da Atividade Parlamentar">
      {/* Resumo */}
      <div className="mb-6 rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Limite Mensal</p>
            <p className="mt-1 font-heading text-2xl font-bold text-[var(--color-neutral-800)]">{formatCurrency(monthlyLimit)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Utilizado</p>
            <p className="mt-1 font-heading text-2xl font-bold text-red-600">{formatCurrency(totalUsed)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Disponível</p>
            <p className={cn('mt-1 font-heading text-2xl font-bold', remaining >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-neutral-500)]">
            <span>{percentage.toFixed(1)}% utilizado</span>
            <span>{formatCurrency(totalUsed)} / {formatCurrency(monthlyLimit)}</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-[var(--color-neutral-100)]">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-green-500',
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Uso por natureza */}
      <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">Uso por Natureza de Despesa</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !usage || usage.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center text-sm text-[var(--color-neutral-400)]">
          Nenhum gasto CEAP registrado neste mês
        </div>
      ) : (
        <div className="space-y-2">
          {usage.map((item: { nature_name: string; total_used: number }, idx: number) => (
            <div key={idx} className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">{item.nature_name}</p>
                <p className="text-sm font-semibold text-[var(--color-neutral-800)]">{formatCurrency(item.total_used)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
