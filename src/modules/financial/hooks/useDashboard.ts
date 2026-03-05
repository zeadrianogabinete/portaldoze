import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';
import { financialService } from '../services/financial.service';
import type { MonthlySummary, OverallBalance, Transaction } from '../types/financial.types';

export function useDashboard(monthStr: string) {
  const monthlySummary = useQuery({
    queryKey: ['financial', 'dashboard', 'monthly', monthStr],
    queryFn: async (): Promise<MonthlySummary> => {
      const { data, error } = await supabase.rpc('obter_resumo_mensal', {
        p_month: monthStr,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        return data[0] as MonthlySummary;
      }

      return {
        total_revenue: 0,
        total_expense: 0,
        balance: 0,
        paid_count: 0,
        pending_count: 0,
        overdue_count: 0,
      };
    },
  });

  const overallBalance = useQuery({
    queryKey: ['financial', 'dashboard', 'overall-balance'],
    queryFn: (): Promise<OverallBalance> => financialService.getOverallBalance(),
  });

  const recentTransactions = useQuery({
    queryKey: ['financial', 'dashboard', 'recent', monthStr],
    queryFn: (): Promise<Transaction[]> => financialService.listRecentTransactions(monthStr),
  });

  return {
    summary: monthlySummary.data,
    overallBalance: overallBalance.data,
    recentTransactions: recentTransactions.data,
    isLoading: monthlySummary.isLoading || overallBalance.isLoading,
    isLoadingTransactions: recentTransactions.isLoading,
  };
}
