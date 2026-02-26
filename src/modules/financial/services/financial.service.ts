import { supabase } from '@/shared/services/supabase';
import type {
  Transaction,
  TransactionFilters,
  CreateTransactionInput,
  FixedExpense,
  ExpenseCategory,
  ExpenseNature,
  FundingSource,
  BankAccount,
  QuotaConfig,
  ReimbursementReport,
  TransactionDocument,
} from '../types/financial.types';

export const financialService = {
  // === Movimentações ===
  async listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let query = supabase
      .from('finan_movimentacoes')
      .select('*, categoria:finan_categorias(*), natureza:finan_naturezas(*), fonte_recurso:finan_fontes_recurso(*)')
      .order('data', { ascending: false });

    if (filters.tipo) query = query.eq('tipo', filters.tipo);
    if (filters.situacao) query = query.eq('situacao', filters.situacao);
    if (filters.categoria_id) query = query.eq('categoria_id', filters.categoria_id);
    if (filters.natureza_id) query = query.eq('natureza_id', filters.natureza_id);
    if (filters.data_inicio) query = query.gte('data', filters.data_inicio);
    if (filters.data_fim) query = query.lte('data', filters.data_fim);
    if (filters.busca) query = query.ilike('descricao', `%${filters.busca}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  },

  async getTransaction(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .select('*, categoria:finan_categorias(*), natureza:finan_naturezas(*), fonte_recurso:finan_fontes_recurso(*), conta_bancaria:finan_contas_bancarias(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .insert({ ...input, criado_por: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async updateTransaction(id: string, input: Partial<CreateTransactionInput>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('finan_movimentacoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markAsPaid(id: string, pagoEm?: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .update({ situacao: 'paid', pago_em: pagoEm ?? new Date().toISOString().split('T')[0] })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  // === Categorias ===
  async listCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('finan_categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data as ExpenseCategory[];
  },

  // === Naturezas ===
  async listNatures(): Promise<ExpenseNature[]> {
    const { data, error } = await supabase
      .from('finan_naturezas')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data as ExpenseNature[];
  },

  // === Fontes de Recurso ===
  async listFundingSources(): Promise<FundingSource[]> {
    const { data, error } = await supabase
      .from('finan_fontes_recurso')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data as FundingSource[];
  },

  // === Contas Bancárias ===
  async listBankAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('finan_contas_bancarias')
      .select('*')
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data as BankAccount[];
  },

  // === Despesas Fixas ===
  async listFixedExpenses(): Promise<FixedExpense[]> {
    const { data, error } = await supabase
      .from('finan_despesas_fixas')
      .select('*, natureza:finan_naturezas(*), fonte_recurso:finan_fontes_recurso(*)')
      .order('descricao');

    if (error) throw error;
    return data as FixedExpense[];
  },

  async createFixedExpense(input: Omit<FixedExpense, 'id' | 'criado_por' | 'criado_em' | 'atualizado_em' | 'natureza' | 'fonte_recurso'>): Promise<FixedExpense> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    const { data, error } = await supabase
      .from('finan_despesas_fixas')
      .insert({ ...input, criado_por: userId })
      .select()
      .single();

    if (error) throw error;
    return data as FixedExpense;
  },

  async updateFixedExpense(id: string, input: Partial<FixedExpense>): Promise<FixedExpense> {
    const { data, error } = await supabase
      .from('finan_despesas_fixas')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FixedExpense;
  },

  async deleteFixedExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('finan_despesas_fixas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // === Cotas ===
  async getQuotaConfig(): Promise<QuotaConfig | null> {
    const { data, error } = await supabase
      .from('finan_cotas')
      .select('*')
      .eq('ativo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as QuotaConfig | null;
  },

  async getQuotaUsage(year: number, month: number): Promise<{ nature_name: string; total_used: number }[]> {
    const { data, error } = await supabase.rpc('obter_uso_ceap', {
      p_year: year,
      p_month: month,
    });

    if (error) throw error;
    return data ?? [];
  },

  // === Relatórios de Reembolso ===
  async listReimbursementReports(): Promise<ReimbursementReport[]> {
    const { data, error } = await supabase
      .from('finan_relatorios_reembolso')
      .select('*')
      .order('periodo_inicio', { ascending: false });

    if (error) throw error;
    return data as ReimbursementReport[];
  },

  async getReimbursementReport(id: string): Promise<ReimbursementReport> {
    const { data, error } = await supabase
      .from('finan_relatorios_reembolso')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ReimbursementReport;
  },

  async createReimbursementReport(input: {
    nome: string;
    periodo_inicio: string;
    periodo_fim: string;
  }): Promise<ReimbursementReport> {
    const { data, error } = await supabase
      .from('finan_relatorios_reembolso')
      .insert({ ...input, situacao: 'draft' })
      .select()
      .single();

    if (error) throw error;
    return data as ReimbursementReport;
  },

  async updateReimbursementReport(
    id: string,
    input: Partial<Pick<ReimbursementReport, 'nome' | 'situacao' | 'enviado_em' | 'recebido_em' | 'valor_recebido' | 'observacoes'>>,
  ): Promise<ReimbursementReport> {
    const { data, error } = await supabase
      .from('finan_relatorios_reembolso')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ReimbursementReport;
  },

  async deleteReimbursementReport(id: string): Promise<void> {
    // Primeiro desvincular transações
    await supabase
      .from('finan_movimentacoes')
      .update({ relatorio_reembolso_id: null })
      .eq('relatorio_reembolso_id', id);

    const { error } = await supabase
      .from('finan_relatorios_reembolso')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getReportTransactions(reportId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .select('*, categoria:finan_categorias(*), natureza:finan_naturezas(*), fonte_recurso:finan_fontes_recurso(*)')
      .eq('relatorio_reembolso_id', reportId)
      .order('data', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  },

  async getEligibleTransactions(periodoInicio: string, periodoFim: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('finan_movimentacoes')
      .select('*, categoria:finan_categorias(*), natureza:finan_naturezas(*), fonte_recurso:finan_fontes_recurso(*)')
      .eq('tipo', 'expense')
      .eq('situacao', 'paid')
      .is('relatorio_reembolso_id', null)
      .gte('data', periodoInicio)
      .lte('data', periodoFim)
      .order('data', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  },

  async linkTransactionsToReport(reportId: string, transactionIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('finan_movimentacoes')
      .update({ relatorio_reembolso_id: reportId })
      .in('id', transactionIds);

    if (error) throw error;

    // Recalcular totais do relatório
    const { data: transactions } = await supabase
      .from('finan_movimentacoes')
      .select('valor')
      .eq('relatorio_reembolso_id', reportId);

    const total = transactions?.reduce((sum, t) => sum + (t.valor ?? 0), 0) ?? 0;
    const count = transactions?.length ?? 0;

    await supabase
      .from('finan_relatorios_reembolso')
      .update({ valor_total: total, total_movimentacoes: count })
      .eq('id', reportId);
  },

  async unlinkTransactionFromReport(transactionId: string, reportId: string): Promise<void> {
    const { error } = await supabase
      .from('finan_movimentacoes')
      .update({ relatorio_reembolso_id: null })
      .eq('id', transactionId);

    if (error) throw error;

    // Recalcular totais
    const { data: transactions } = await supabase
      .from('finan_movimentacoes')
      .select('valor')
      .eq('relatorio_reembolso_id', reportId);

    const total = transactions?.reduce((sum, t) => sum + (t.valor ?? 0), 0) ?? 0;
    const count = transactions?.length ?? 0;

    await supabase
      .from('finan_relatorios_reembolso')
      .update({ valor_total: total, total_movimentacoes: count })
      .eq('id', reportId);
  },

  // === Documentos ===
  async getTransactionDocuments(movimentacaoId: string): Promise<TransactionDocument[]> {
    const { data, error } = await supabase
      .from('finan_documentos')
      .select('*')
      .eq('movimentacao_id', movimentacaoId)
      .order('criado_em');

    if (error) throw error;
    return data as TransactionDocument[];
  },

  async deleteDocument(docId: string, filePath: string): Promise<void> {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    const { error } = await supabase
      .from('finan_documentos')
      .delete()
      .eq('id', docId);

    if (error) throw error;
  },

  async getDocumentUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600);

    if (error) throw error;
    return data.signedUrl;
  },

  async uploadDocument(
    movimentacaoId: string,
    file: File,
    _documentType: string,
  ): Promise<TransactionDocument> {
    const filePath = `transactions/${movimentacaoId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('finan_documentos')
      .insert({
        movimentacao_id: movimentacaoId,
        nome_arquivo: file.name,
        caminho_arquivo: filePath,
        tamanho_arquivo: file.size,
        tipo_arquivo: file.type,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TransactionDocument;
  },
};
