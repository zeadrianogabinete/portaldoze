import { supabase } from '@/shared/services/supabase';
import type {
  Transaction,
  TransactionFilters,
  CreateTransactionInput,
  FixedExpense,
  ExpenseCategory,
  ExpenseNature,
  FundingSource,
  QuotaConfig,
  ReimbursementReport,
  TransactionDocument,
} from '../types/financial.types';

export const financialService = {
  // === Transacoes ===
  async listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*, category:expense_categories(*), nature:expense_natures(*), funding_source:funding_sources(*)')
      .order('date', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.nature_id) query = query.eq('nature_id', filters.nature_id);
    if (filters.start_date) query = query.gte('date', filters.start_date);
    if (filters.end_date) query = query.lte('date', filters.end_date);
    if (filters.search) query = query.ilike('description', `%${filters.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data as Transaction[];
  },

  async getTransaction(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:expense_categories(*), nature:expense_natures(*), funding_source:funding_sources(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...input, created_by: userId })
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async updateTransaction(id: string, input: Partial<CreateTransactionInput>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async markAsPaid(id: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status: 'paid', paid_at: new Date().toISOString().split('T')[0] })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  // === Categorias ===
  async listCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as ExpenseCategory[];
  },

  // === Naturezas ===
  async listNatures(): Promise<ExpenseNature[]> {
    const { data, error } = await supabase
      .from('expense_natures')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as ExpenseNature[];
  },

  // === Fontes de Recurso ===
  async listFundingSources(): Promise<FundingSource[]> {
    const { data, error } = await supabase
      .from('funding_sources')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as FundingSource[];
  },

  // === Despesas Fixas ===
  async listFixedExpenses(): Promise<FixedExpense[]> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .select('*')
      .order('description');

    if (error) throw error;
    return data as FixedExpense[];
  },

  async createFixedExpense(input: Omit<FixedExpense, 'id' | 'created_at' | 'updated_at'>): Promise<FixedExpense> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as FixedExpense;
  },

  async updateFixedExpense(id: string, input: Partial<FixedExpense>): Promise<FixedExpense> {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FixedExpense;
  },

  async deleteFixedExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('fixed_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // === Cotas ===
  async getQuotaConfig(): Promise<QuotaConfig | null> {
    const { data, error } = await supabase
      .from('quota_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as QuotaConfig | null;
  },

  async getQuotaUsage(year: number, month: number): Promise<{ nature_name: string; total_used: number }[]> {
    const { data, error } = await supabase.rpc('get_ceap_usage', {
      p_year: year,
      p_month: month,
    });

    if (error) throw error;
    return data ?? [];
  },

  // === Relatorios de Reembolso ===
  async listReimbursementReports(): Promise<ReimbursementReport[]> {
    const { data, error } = await supabase
      .from('reimbursement_reports')
      .select('*')
      .order('month', { ascending: false });

    if (error) throw error;
    return data as ReimbursementReport[];
  },

  // === Documentos ===
  async getTransactionDocuments(transactionId: string): Promise<TransactionDocument[]> {
    const { data, error } = await supabase
      .from('transaction_documents')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at');

    if (error) throw error;
    return data as TransactionDocument[];
  },

  async uploadDocument(
    transactionId: string,
    file: File,
    documentType: string,
  ): Promise<TransactionDocument> {
    const filePath = `transactions/${transactionId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('transaction_documents')
      .insert({
        transaction_id: transactionId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
      })
      .select()
      .single();

    if (error) throw error;
    return data as TransactionDocument;
  },
};
