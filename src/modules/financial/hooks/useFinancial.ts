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
    mutationFn: (args: string | { id: string; pago_em?: string }) => {
      const id = typeof args === 'string' ? args : args.id;
      const pagoEm = typeof args === 'string' ? undefined : args.pago_em;
      return financialService.markAsPaid(id, pagoEm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial'] });
      queryClient.invalidateQueries({ queryKey: ['transaction'] });
      toast.success('Transação marcada como paga');
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

export function useBankAccounts() {
  return useQuery({
    queryKey: ['financial', 'bank-accounts'],
    queryFn: () => financialService.listBankAccounts(),
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

export function useReimbursementReport(id: string) {
  return useQuery({
    queryKey: ['financial', 'reimbursement-report', id],
    queryFn: () => financialService.getReimbursementReport(id),
    enabled: !!id,
  });
}

export function useReportTransactions(reportId: string) {
  return useQuery({
    queryKey: ['financial', 'report-transactions', reportId],
    queryFn: () => financialService.getReportTransactions(reportId),
    enabled: !!reportId,
  });
}

export function useEligibleTransactions(periodoInicio: string, periodoFim: string) {
  return useQuery({
    queryKey: ['financial', 'eligible-transactions', periodoInicio, periodoFim],
    queryFn: () => financialService.getEligibleTransactions(periodoInicio, periodoFim),
    enabled: !!periodoInicio && !!periodoFim,
  });
}

export function useReportMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: { nome: string; periodo_inicio: string; periodo_fim: string }) =>
      financialService.createReimbursementReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-reports'] });
      toast.success('Relatório criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar relatório: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof financialService.updateReimbursementReport>[1] }) =>
      financialService.updateReimbursementReport(id, input),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-reports'] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-report', vars.id] });
      toast.success('Relatório atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar relatório: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financialService.deleteReimbursementReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-reports'] });
      toast.success('Relatório excluído');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir relatório: ${error.message}`);
    },
  });

  const linkMutation = useMutation({
    mutationFn: ({ reportId, transactionIds }: { reportId: string; transactionIds: string[] }) =>
      financialService.linkTransactionsToReport(reportId, transactionIds),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'report-transactions', vars.reportId] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-report', vars.reportId] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-reports'] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'eligible-transactions'] });
      toast.success('Transações vinculadas ao relatório');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao vincular transações: ${error.message}`);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: ({ transactionId, reportId }: { transactionId: string; reportId: string }) =>
      financialService.unlinkTransactionFromReport(transactionId, reportId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'report-transactions', vars.reportId] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-report', vars.reportId] });
      queryClient.invalidateQueries({ queryKey: ['financial', 'reimbursement-reports'] });
      toast.success('Transação desvinculada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao desvincular transação: ${error.message}`);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    link: linkMutation,
    unlink: unlinkMutation,
  };
}

export function useTransactionDocuments(movimentacaoId: string) {
  return useQuery({
    queryKey: ['financial', 'documents', movimentacaoId],
    queryFn: () => financialService.getTransactionDocuments(movimentacaoId),
    enabled: !!movimentacaoId,
  });
}

export function useDocumentMutations() {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ movimentacaoId, file, documentType }: { movimentacaoId: string; file: File; documentType: string }) =>
      financialService.uploadDocument(movimentacaoId, file, documentType),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'documents', vars.movimentacaoId] });
      toast.success('Documento enviado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar documento: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ docId, filePath }: { docId: string; filePath: string }) =>
      financialService.deleteDocument(docId, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'documents'] });
      toast.success('Documento excluído');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir documento: ${error.message}`);
    },
  });

  return { upload: uploadMutation, remove: deleteMutation };
}
