import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/services/supabase';

interface MonthlySummary {
  total_revenue: number;
  total_expense: number;
  balance: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export function useDashboard(monthStr: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial', 'dashboard', monthStr],
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

  return {
    summary: data,
    isLoading,
    error,
  };
}
