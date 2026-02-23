import { useState } from 'react';
import { createFileRoute, Link, useMatchRoute } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { cn } from '@/shared/utils/cn';
import { FinancialDashboard } from '@/modules/financial/components/dashboard/FinancialDashboard';

export const Route = createFileRoute('/_authenticated/financial/')({
  component: FinancialPage,
});

function FinancialPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-neutral-800)]">
            Financeiro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="min-w-[160px] text-center font-heading text-base font-semibold capitalize text-[var(--color-neutral-800)]">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
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
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-1 border-b border-[var(--color-neutral-200)]">
        {tabs.map((tab) => {
          const active = !!matchRoute({ to: tab.href });
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-[var(--color-neutral-500)] hover:border-[var(--color-neutral-300)] hover:text-[var(--color-neutral-700)]',
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
