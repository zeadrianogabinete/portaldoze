import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { formatCurrency } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/settings/financial')({
  component: ConfigFinanceiro,
});

function ConfigFinanceiro() {
  const { data: natures } = useQuery({
    queryKey: ['settings', 'natures'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expense_natures').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['settings', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expense_categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: sources } = useQuery({
    queryKey: ['settings', 'sources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('funding_sources').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: quotaConfig } = useQuery({
    queryKey: ['settings', 'quota-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quota_config').select('*').eq('is_active', true).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  return (
    <PageContainer
      title="Configurações Financeiras"
      actions={
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Cota CEAP */}
        {quotaConfig && (
          <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
            <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">Cota CEAP</h3>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">Limite mensal: {formatCurrency(quotaConfig.monthly_limit)}</p>
          </div>
        )}

        {/* Naturezas */}
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">
            Naturezas de Despesa ({natures?.length ?? 0})
          </h3>
          <div className="space-y-2">
            {natures?.map((n: { id: string; name: string; code: string; ceap_eligible: boolean; is_active: boolean }) => (
              <div key={n.id} className="flex items-center justify-between rounded-xl border border-[var(--color-neutral-100)] bg-[var(--surface-elevated)] px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">{n.name}</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">Código: {n.code}</p>
                </div>
                <div className="flex gap-2">
                  {n.ceap_eligible && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">CEAP</span>
                  )}
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    n.is_active ? 'bg-green-50 text-green-700' : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
                  )}>
                    {n.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categorias */}
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">
            Categorias ({categories?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories?.map((c: { id: string; name: string }) => (
              <span key={c.id} className="rounded-full bg-[var(--color-neutral-100)] px-3 py-1 text-xs font-semibold text-[var(--color-neutral-700)]">
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Fontes de Recurso */}
        <div className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 font-heading text-base font-semibold text-[var(--color-neutral-800)]">
            Fontes de Recurso ({sources?.length ?? 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {sources?.map((s: { id: string; name: string }) => (
              <span key={s.id} className="rounded-full bg-[var(--color-neutral-100)] px-3 py-1 text-xs font-semibold text-[var(--color-neutral-700)]">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
