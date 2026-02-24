export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ExpenseNature {
  id: string;
  name: string;
  code: string;
  description: string | null;
  ceap_eligible: boolean;
  has_quota: boolean;
  monthly_quota: number | null;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface FundingSource {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  agency: string;
  account_number: string;
  account_type: 'checking' | 'savings';
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  type: 'expense' | 'revenue';
  description: string;
  amount: number;
  date: string;
  due_date: string | null;
  paid_at: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method: 'pix' | 'transfer' | 'boleto' | 'credit_card' | 'debit_card' | 'cash' | 'check' | 'other';
  receipt_type: 'nota_fiscal' | 'recibo' | 'cupom_fiscal' | 'contrato' | 'outros';
  receipt_number: string | null;
  category_id: string | null;
  nature_id: string | null;
  funding_source_id: string | null;
  bank_account_id: string | null;
  contact_id: string | null;
  reimbursement_report_id: string | null;
  fixed_expense_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations (optional, populated via select)
  category?: ExpenseCategory;
  nature?: ExpenseNature;
  funding_source?: FundingSource;
}

export interface TransactionDocument {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_type: 'receipt' | 'invoice' | 'contract' | 'report' | 'other';
  created_at: string;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  day_of_month: number;
  category_id: string | null;
  nature_id: string | null;
  funding_source_id: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReimbursementReport {
  id: string;
  month: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_amount: number;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuotaConfig {
  id: string;
  name: string;
  monthly_limit: number;
  year: number;
  is_active: boolean;
  created_at: string;
}

export interface QuotaUsage {
  nature_name: string;
  nature_code: string;
  total_used: number;
  monthly_limit: number;
  percentage: number;
}

export interface MonthlySummary {
  total_revenue: number;
  total_expense: number;
  balance: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface TransactionFilters {
  type?: 'expense' | 'revenue';
  status?: string;
  category_id?: string;
  nature_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface CreateTransactionInput {
  type: 'expense' | 'revenue';
  description: string;
  amount: number;
  date: string;
  due_date?: string;
  status?: 'pending' | 'paid';
  payment_method?: string;
  receipt_type?: string;
  receipt_number?: string;
  category_id?: string;
  nature_id?: string;
  funding_source_id?: string;
  bank_account_id?: string;
  contact_id?: string;
  notes?: string;
}
