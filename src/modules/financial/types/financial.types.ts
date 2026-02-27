export interface ExpenseCategory {
  id: string;
  nome: string;
  codigo: string | null;
  descricao: string | null;
  tem_cota: boolean;
  cota_mensal: number | null;
  ativo: boolean;
  ordem: number;
  criado_em: string;
}

export interface ExpenseNature {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  elegivel_ceap: boolean;
  tem_cota: boolean;
  cota_mensal: number | null;
  categoria_id: string | null;
  ativo: boolean;
  ordem: number;
  criado_em: string;
}

export interface FundingSource {
  id: string;
  nome: string;
  tipo: 'expense' | 'revenue';
  codigo: string | null;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  criado_em: string;
}

export interface BankAccount {
  id: string;
  nome_banco: string;
  agencia: string | null;
  numero_conta: string | null;
  tipo_conta: string | null;
  titular: string | null;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface Transaction {
  id: string;
  numero: string;
  tipo: 'expense' | 'revenue';
  descricao: string;
  valor: number;
  data: string;
  data_vencimento: string | null;
  pago_em: string | null;
  situacao: 'pending' | 'paid' | 'overdue' | 'cancelled';
  forma_pagamento: 'pix' | 'transfer' | 'boleto' | 'credit_card' | 'debit_card' | 'cash' | 'check' | 'other';
  tipo_comprovante: 'nota_fiscal' | 'recibo' | 'cupom_fiscal' | 'contrato' | 'outros';
  categoria_id: string | null;
  natureza_id: string | null;
  fonte_recurso_id: string | null;
  conta_bancaria_id: string | null;
  contato_id: string | null;
  relatorio_reembolso_id: string | null;
  despesa_fixa_id: string | null;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  // Relações (opcional, populado via select)
  categoria?: ExpenseCategory;
  natureza?: ExpenseNature;
  fonte_recurso?: FundingSource;
  conta_bancaria?: BankAccount;
}

export interface TransactionDocument {
  id: string;
  movimentacao_id: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_arquivo: number;
  tipo_arquivo: string;
  criado_em: string;
}

export interface FixedExpense {
  id: string;
  descricao: string;
  valor: number;
  natureza_id: string | null;
  fonte_recurso_id: string | null;
  conta_bancaria_id: string | null;
  forma_pagamento: 'pix' | 'transfer' | 'boleto' | 'card' | null;
  contato_nome: string;
  contato_telefone: string | null;
  contato_email: string | null;
  contato_dados_pagamento: string | null;
  contato_id: string | null;
  parcelado: boolean;
  total_parcelas: number | null;
  data_inicio: string | null;
  dia_vencimento: number | null;
  ativo: boolean;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  // Relações (opcional, populado via select)
  natureza?: ExpenseNature;
  fonte_recurso?: FundingSource;
}

export interface ReimbursementReport {
  id: string;
  nome: string;
  periodo_inicio: string;
  periodo_fim: string;
  situacao: 'draft' | 'sent' | 'received';
  enviado_em: string | null;
  recebido_em: string | null;
  valor_recebido: number | null;
  valor_total: number | null;
  total_movimentacoes: number | null;
  caminho_exportacao: string | null;
  observacoes: string | null;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
}

export interface QuotaConfig {
  id: string;
  nome: string;
  total_mensal: number;
  ativo: boolean;
  descricao: string | null;
  atualizado_em: string;
}

export interface QuotaUsage {
  natureza_nome: string;
  natureza_codigo: string;
  total_gasto: number;
  cota_mensal: number;
  percentual_uso: number;
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
  tipo?: 'expense' | 'revenue';
  situacao?: string;
  categoria_id?: string;
  natureza_id?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

export interface CreateTransactionInput {
  tipo: 'expense' | 'revenue';
  descricao: string;
  valor: number;
  data: string;
  data_vencimento?: string;
  situacao?: 'pending' | 'paid';
  forma_pagamento?: string;
  tipo_comprovante?: string;
  categoria_id?: string;
  natureza_id?: string;
  fonte_recurso_id?: string;
  conta_bancaria_id?: string;
  contato_id?: string;
  observacoes?: string;
}

// === Input types para CRUD de configurações ===

export interface CreateCategoryInput {
  nome: string;
  descricao?: string;
  tem_cota?: boolean;
  cota_mensal?: number;
}

export interface CreateNatureInput {
  codigo: string;
  nome: string;
  descricao?: string;
  elegivel_ceap?: boolean;
  tem_cota?: boolean;
  cota_mensal?: number;
  categoria_id?: string;
}

export interface CreateFundingSourceInput {
  nome: string;
  tipo: 'expense' | 'revenue';
  codigo?: string;
  descricao?: string;
}

export interface CreateBankAccountInput {
  nome_banco: string;
  agencia?: string;
  numero_conta?: string;
  tipo_conta?: string;
  titular?: string;
  descricao?: string;
}
