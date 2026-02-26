import { useMemo } from 'react';
import { parseISO, isToday, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { useTransactions } from './useFinancial';
import type { Transaction } from '../types/financial.types';

interface PayablesFilters {
  search?: string;
}

export interface PayablesSummary {
  totalPending: number;
  totalOverdue: number;
  countPending: number;
  countOverdue: number;
  countDueToday: number;
  totalDueToday: number;
  countDueThisWeek: number;
  totalDueThisWeek: number;
}

export interface GroupedPayables {
  overdue: Transaction[];
  dueToday: Transaction[];
  upcoming: Transaction[];
}

const sortByDueDate = (a: Transaction, b: Transaction) => {
  const da = a.data_vencimento ? parseISO(a.data_vencimento).getTime() : Infinity;
  const db = b.data_vencimento ? parseISO(b.data_vencimento).getTime() : Infinity;
  return da - db;
};

const sum = (arr: Transaction[]) => arr.reduce((acc, t) => acc + t.valor, 0);

export function usePayables(filters: PayablesFilters = {}) {
  const pendingQuery = useTransactions({
    tipo: 'expense',
    situacao: 'pending',
    busca: filters.search || undefined,
  });

  const overdueQuery = useTransactions({
    tipo: 'expense',
    situacao: 'overdue',
    busca: filters.search || undefined,
  });

  const isLoading = pendingQuery.isLoading || overdueQuery.isLoading;
  const error = pendingQuery.error || overdueQuery.error;

  const { summary, grouped } = useMemo(() => {
    const pending = pendingQuery.data ?? [];
    const overdue = overdueQuery.data ?? [];

    const today = startOfDay(new Date());
    const weekEnd = endOfDay(addDays(today, 7));

    // Classificar pendentes entre "vence hoje" e "próximas"
    const dueToday: Transaction[] = [];
    const upcoming: Transaction[] = [];

    for (const t of pending) {
      if (t.data_vencimento && isToday(parseISO(t.data_vencimento))) {
        dueToday.push(t);
      } else {
        upcoming.push(t);
      }
    }

    // Ordenar cada grupo por data_vencimento ASC
    overdue.sort(sortByDueDate);
    dueToday.sort(sortByDueDate);
    upcoming.sort(sortByDueDate);

    // Contas que vencem nos próximos 7 dias (excluindo hoje)
    const dueThisWeek = pending.filter((t) => {
      if (!t.data_vencimento) return false;
      const d = parseISO(t.data_vencimento);
      return !isToday(d) && !isBefore(d, today) && isBefore(d, weekEnd);
    });

    const summary: PayablesSummary = {
      totalPending: sum(pending),
      totalOverdue: sum(overdue),
      countPending: pending.length,
      countOverdue: overdue.length,
      countDueToday: dueToday.length,
      totalDueToday: sum(dueToday),
      countDueThisWeek: dueThisWeek.length,
      totalDueThisWeek: sum(dueThisWeek),
    };

    const grouped: GroupedPayables = { overdue, dueToday, upcoming };

    return { summary, grouped };
  }, [pendingQuery.data, overdueQuery.data]);

  return { summary, grouped, isLoading, error };
}
