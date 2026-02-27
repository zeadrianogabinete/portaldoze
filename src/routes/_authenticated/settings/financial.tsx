import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import {
  QuotaSection,
  CategoriesSection,
  NaturesSection,
  FundingSourcesSection,
  BankAccountsSection,
} from '@/modules/settings/components/financial';

export const Route = createFileRoute('/_authenticated/settings/financial')({
  component: ConfigFinanceiro,
});

function ConfigFinanceiro() {
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
        <QuotaSection />
        <CategoriesSection />
        <NaturesSection />
        <FundingSourcesSection />
        <BankAccountsSection />
      </div>
    </PageContainer>
  );
}
