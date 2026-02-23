import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { usePermission } from '@/shared/hooks/usePermission';
import { MonthView } from '@/modules/agenda/components/calendar/MonthView';
import { ListView } from '@/modules/agenda/components/calendar/ListView';
import { ViewSwitcher } from '@/modules/agenda/components/calendar/ViewSwitcher';

export const Route = createFileRoute('/_authenticated/agenda/')({
  component: AgendaPage,
});

type ViewMode = 'month' | 'week' | 'day' | 'list';

function AgendaPage() {
  const { can } = usePermission();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const goToPrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => subMonths(d, 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((d) => addMonths(d, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <PageContainer
      title="Agenda"
      actions={
        <div className="flex items-center gap-2">
          {can('agenda', 'approve') && (
            <Link
              to="/agenda/proposals"
              className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-50)]"
            >
              Propostas
            </Link>
          )}
          {can('agenda', 'create') && (
            <Link
              to="/agenda/new"
              className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              <Plus size={16} strokeWidth={2} />
              Nova agenda
            </Link>
          )}
        </div>
      }
    >
      {/* Header do calendário */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrev}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <h2 className="min-w-[180px] text-center font-heading text-lg font-semibold capitalize text-[var(--color-neutral-800)]">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button
            type="button"
            onClick={goToNext}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="ml-2 rounded-lg border border-[var(--color-neutral-200)] px-3 py-1.5 text-xs font-medium text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-50)]"
          >
            Hoje
          </button>
        </div>

        <ViewSwitcher value={viewMode} onChange={setViewMode} />
      </div>

      {/* Conteúdo do calendário */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-[var(--shadow-card)]">
        {viewMode === 'month' && <MonthView currentDate={currentDate} />}
        {viewMode === 'list' && <ListView currentDate={currentDate} />}
        {(viewMode === 'week' || viewMode === 'day') && (
          <div className="flex items-center justify-center py-20 text-sm text-[var(--color-neutral-400)]">
            Visualização {viewMode === 'week' ? 'semanal' : 'diária'} em desenvolvimento
          </div>
        )}
      </div>
    </PageContainer>
  );
}
