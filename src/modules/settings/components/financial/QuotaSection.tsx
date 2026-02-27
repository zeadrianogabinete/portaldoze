'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/format';
import { useSettingsQuotaConfig } from '../../hooks/useFinancialSettings';
import { QuotaEditDialog } from './QuotaEditDialog';

export function QuotaSection() {
  const { data: quotaConfig } = useSettingsQuotaConfig();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!quotaConfig) return null;

  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">Cota CEAP</h3>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Limite mensal: <span className="font-semibold text-[var(--color-neutral-700)]">{formatCurrency(quotaConfig.total_mensal)}</span>
          </p>
          {quotaConfig.descricao && (
            <p className="mt-0.5 text-xs text-[var(--color-neutral-400)]">{quotaConfig.descricao}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded-lg p-2 text-[var(--color-neutral-400)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-600)]"
        >
          <Pencil size={16} />
        </button>
      </div>

      <QuotaEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quota={quotaConfig}
      />
    </div>
  );
}
