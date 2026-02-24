import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { useAgendas } from '@/modules/agenda/hooks/useAgendas';

interface MonthViewProps {
  currentDate: Date;
}

const weekDays = [
  { short: 'S', full: 'Seg' },
  { short: 'T', full: 'Ter' },
  { short: 'Q', full: 'Qua' },
  { short: 'Q', full: 'Qui' },
  { short: 'S', full: 'Sex' },
  { short: 'S', full: 'Sáb' },
  { short: 'D', full: 'Dom' },
];

export function MonthView({ currentDate }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const { agendas } = useAgendas({
    startDate: calendarStart,
    endDate: calendarEnd,
  });

  const getAgendasForDay = (day: Date) => {
    return agendas.filter((agenda) => {
      const start = new Date(agenda.start_at);
      return isSameDay(start, day);
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      {/* Header dias da semana */}
      <div className="grid grid-cols-7 border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
        {weekDays.map((day) => (
          <div
            key={day.full}
            className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]"
          >
            <span className="sm:hidden">{day.short}</span>
            <span className="hidden sm:inline">{day.full}</span>
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayAgendas = getAgendasForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[78px] border-b border-r border-[var(--color-neutral-100)] p-1.5 transition-colors sm:min-h-[100px] sm:p-2 lg:min-h-[120px]',
                !inMonth && 'bg-[var(--color-neutral-50)]/50',
                'cursor-pointer hover:bg-primary-50/30',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                    today && 'bg-primary-500 font-bold text-white',
                    !today && inMonth && 'text-[var(--color-neutral-700)]',
                    !today && !inMonth && 'text-[var(--color-neutral-400)]',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Eventos do dia */}
              <div className="mt-1 space-y-0.5">
                {dayAgendas.slice(0, 3).map((agenda) => (
                  <div
                    key={agenda.id}
                    className={cn(
                      'truncate rounded-md px-1 py-0.5 text-[9px] font-semibold leading-tight sm:px-1.5 sm:text-[10px] lg:text-xs',
                      agenda.status === 'approved'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
                    )}
                    title={agenda.title}
                  >
                    <span className="sm:hidden">• evento</span>
                    <span className="hidden sm:inline">{agenda.title}</span>
                  </div>
                ))}
                {dayAgendas.length > 3 && (
                  <p className="px-1.5 text-[10px] font-medium text-[var(--color-neutral-400)]">
                    +{dayAgendas.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
