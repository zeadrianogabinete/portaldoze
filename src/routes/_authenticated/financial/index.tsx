import { useState } from 'react';
import { createFileRoute, Link, useMatchRoute } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { cn } from '@/shared/utils/cn';
import { FinancialDashboard } from '@/modules/financial/components/dashboard/FinancialDashboard';
import { Badge } from '@/shared/components/ui/Badge';

export const Route = createFileRoute('/_authenticated/financial/')({
  component: FinancialPage,
});

function FinancialPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <PageContainer>
      <div className="mb-6 rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-500/12 p-2.5 text-primary-600">
              <Wallet size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
                Financeiro
              </h1>
              <p className="text-sm text-[var(--color-neutral-500)]">
                Gestão centralizada de receitas, despesas, cotas e relatórios.
              </p>
            </div>
          </div>

          <Badge variant="neutral">Atualização em tempo real</Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
            className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="min-w-[180px] text-center font-heading text-base font-semibold capitalize text-[var(--color-neutral-800)]">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
            aria-label="Próximo mês"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Tabs de navegação */}
      <FinancialTabs />

      {/* Dashboard */}
      <FinancialDashboard currentMonth={currentMonth} />
    </PageContainer>
  );
}

function FinancialTabs() {
  const matchRoute = useMatchRoute();

  const tabs = [
    { label: 'Dashboard', href: '/financial' },
    { label: 'Despesas', href: '/financial/expenses' },
    { label: 'Receitas', href: '/financial/revenues' },
    { label: 'Fixas', href: '/financial/fixed' },
    { label: 'Cotas', href: '/financial/quotas' },
    { label: 'Relatórios', href: '/financial/reports' },
  ];

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-1.5 shadow-[var(--shadow-card)]">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const active = !!matchRoute({ to: tab.href });
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-500/12 text-primary-700'
                  : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
