import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { financialService } from '@/modules/financial/services/financial.service';
import type {
  CreateCategoryInput,
  CreateNatureInput,
  CreateFundingSourceInput,
  CreateBankAccountInput,
  ExpenseCategory,
  ExpenseNature,
  FundingSource,
  BankAccount,
} from '@/modules/financial/types/financial.types';

// === Query hooks (busca TODOS os itens, incluindo inativos) ===

export function useSettingsCategories() {
  return useQuery({
    queryKey: ['settings', 'categories'],
    queryFn: () => financialService.listAllCategories(),
  });
}

export function useSettingsNatures() {
  return useQuery({
    queryKey: ['settings', 'natures'],
    queryFn: () => financialService.listAllNatures(),
  });
}

export function useSettingsFundingSources() {
  return useQuery({
    queryKey: ['settings', 'sources'],
    queryFn: () => financialService.listAllFundingSources(),
  });
}

export function useSettingsBankAccounts() {
  return useQuery({
    queryKey: ['settings', 'bank-accounts'],
    queryFn: () => financialService.listAllBankAccounts(),
  });
}

export function useSettingsQuotaConfig() {
  return useQuery({
    queryKey: ['settings', 'quota-config'],
    queryFn: () => financialService.getQuotaConfig(),
  });
}

// === Mutation hooks ===

export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] });
    queryClient.invalidateQueries({ queryKey: ['financial', 'categories'] });
  };

  const create = useMutation({
    mutationFn: (input: CreateCategoryInput) => financialService.createCategory(input),
    onSuccess: () => { invalidate(); toast.success('Categoria criada'); },
    onError: (e: Error) => toast.error(`Erro ao criar categoria: ${e.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseCategory> }) =>
      financialService.updateCategory(id, input),
    onSuccess: () => { invalidate(); toast.success('Categoria atualizada'); },
    onError: (e: Error) => toast.error(`Erro ao atualizar categoria: ${e.message}`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => financialService.deleteCategory(id),
    onSuccess: () => { invalidate(); toast.success('Categoria excluída'); },
    onError: (e: Error) => toast.error(`Erro ao excluir categoria: ${e.message}`),
  });

  return { create, update, remove };
}

export function useNatureMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'natures'] });
    queryClient.invalidateQueries({ queryKey: ['financial', 'natures'] });
  };

  const create = useMutation({
    mutationFn: (input: CreateNatureInput) => financialService.createNature(input),
    onSuccess: () => { invalidate(); toast.success('Natureza criada'); },
    onError: (e: Error) => toast.error(`Erro ao criar natureza: ${e.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseNature> }) =>
      financialService.updateNature(id, input),
    onSuccess: () => { invalidate(); toast.success('Natureza atualizada'); },
    onError: (e: Error) => toast.error(`Erro ao atualizar natureza: ${e.message}`),
  });

  return { create, update };
}

export function useFundingSourceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'sources'] });
    queryClient.invalidateQueries({ queryKey: ['financial', 'funding-sources'] });
  };

  const create = useMutation({
    mutationFn: (input: CreateFundingSourceInput) => financialService.createFundingSource(input),
    onSuccess: () => { invalidate(); toast.success('Fonte de recurso criada'); },
    onError: (e: Error) => toast.error(`Erro ao criar fonte: ${e.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<FundingSource> }) =>
      financialService.updateFundingSource(id, input),
    onSuccess: () => { invalidate(); toast.success('Fonte de recurso atualizada'); },
    onError: (e: Error) => toast.error(`Erro ao atualizar fonte: ${e.message}`),
  });

  return { create, update };
}

export function useBankAccountMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'bank-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['financial', 'bank-accounts'] });
  };

  const create = useMutation({
    mutationFn: (input: CreateBankAccountInput) => financialService.createBankAccount(input),
    onSuccess: () => { invalidate(); toast.success('Conta bancária criada'); },
    onError: (e: Error) => toast.error(`Erro ao criar conta: ${e.message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<BankAccount> }) =>
      financialService.updateBankAccount(id, input),
    onSuccess: () => { invalidate(); toast.success('Conta bancária atualizada'); },
    onError: (e: Error) => toast.error(`Erro ao atualizar conta: ${e.message}`),
  });

  return { create, update };
}

export function useQuotaMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'quota-config'] });
    queryClient.invalidateQueries({ queryKey: ['financial', 'quota-config'] });
  };

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { total_mensal: number; descricao?: string } }) =>
      financialService.updateQuotaConfig(id, input),
    onSuccess: () => { invalidate(); toast.success('Cota atualizada'); },
    onError: (e: Error) => toast.error(`Erro ao atualizar cota: ${e.message}`),
  });

  return { update };
}
