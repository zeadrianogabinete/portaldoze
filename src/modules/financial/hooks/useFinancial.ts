import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financialService } from '../services/financial.service';
import type { TransactionFilters, CreateTransactionInput } from '../types/financial.types';

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => financialService.listTransactions(filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => financialService.getTransaction(id),
    enabled: !!id,
  });
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateTransactionInput) => financialService.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Transacao criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar transacao: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateTransactionInput> }) =>
      financialService.updateTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Transacao atualizada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Transacao excluida');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) => financialService.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast.success('Transacao marcada como paga');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    markAsPaid: markAsPaidMutation,
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ['financial', 'categories'],
    queryFn: () => financialService.listCategories(),
  });
}

export function useNatures() {
  return useQuery({
    queryKey: ['financial', 'natures'],
    queryFn: () => financialService.listNatures(),
  });
}

export function useFundingSources() {
  return useQuery({
    queryKey: ['financial', 'funding-sources'],
    queryFn: () => financialService.listFundingSources(),
  });
}

export function useFixedExpenses() {
  return useQuery({
    queryKey: ['financial', 'fixed-expenses'],
    queryFn: () => financialService.listFixedExpenses(),
  });
}

export function useQuotaConfig() {
  return useQuery({
    queryKey: ['financial', 'quota-config'],
    queryFn: () => financialService.getQuotaConfig(),
  });
}

export function useQuotaUsage(year: number, month: number) {
  return useQuery({
    queryKey: ['financial', 'quota-usage', year, month],
    queryFn: () => financialService.getQuotaUsage(year, month),
  });
}

export function useReimbursementReports() {
  return useQuery({
    queryKey: ['financial', 'reimbursement-reports'],
    queryFn: () => financialService.listReimbursementReports(),
  });
}
