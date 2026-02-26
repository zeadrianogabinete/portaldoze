import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAgendas } from '@/modules/agenda/hooks/useAgendas';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Calendar } from 'lucide-react';

interface ListViewProps {
  currentDate: Date;
}

export function ListView({ currentDate }: ListViewProps) {
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { agendas, isLoading } = useAgendas({ startDate, endDate });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  if (agendas.length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={40} strokeWidth={1.5} />}
        title="Nenhum compromisso"
        description="Não há agendas para este período"
      />
    );
  }

  // Agrupar por dia
  const grouped = agendas.reduce<Record<string, typeof agendas>>((acc, agenda) => {
    const dayKey = format(new Date(agenda.inicio_em), 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(agenda);
    return acc;
  }, {});

  const sortedDays = Object.keys(grouped).sort();

  const presenceLabels = {
    politician: 'Político presente',
    representative: 'Representante',
    none: 'Sem presença',
  };

  const presenceColors = {
    politician: 'text-primary-600',
    representative: 'text-[var(--color-accent-green)]',
    none: 'text-[var(--color-neutral-400)]',
  };

  return (
    <div className="divide-y divide-[var(--color-neutral-100)]">
      {sortedDays.map((dayKey) => {
        const day = new Date(dayKey);
        const dayAgendas = grouped[dayKey] ?? [];

        return (
          <div key={dayKey}>
            <div className="sticky top-0 bg-[var(--color-neutral-50)] px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div className="space-y-1 p-2">
              {dayAgendas.map((agenda) => (
                <div
                  key={agenda.id}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--color-neutral-50)]"
                >
                  {/* Dot de status */}
                  <div
                    className={cn(
                      'mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                      agenda.situacao === 'approved' ? 'bg-primary-500' : 'bg-[var(--color-accent-yellow)]',
                    )}
                  />

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-[var(--color-neutral-800)]">
                        {format(new Date(agenda.inicio_em), 'HH:mm')}-{format(new Date(agenda.fim_em), 'HH:mm')}
                      </span>
                      <span className="text-sm font-semibold text-[var(--color-neutral-800)]">
                        {agenda.titulo}
                      </span>
                      {agenda.situacao === 'proposed' && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                          PROPOSTA
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--color-neutral-500)]">
                      {agenda.local_nome && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} strokeWidth={1.5} />
                          {agenda.local_nome}
                        </span>
                      )}
                      <span className={cn('flex items-center gap-1', presenceColors[agenda.presenca_parlamentar])}>
                        <User size={12} strokeWidth={1.5} />
                        {presenceLabels[agenda.presenca_parlamentar]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
