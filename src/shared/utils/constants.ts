export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Mandato';

export const ROLES = {
  ADMIN: 'admin',
  POLITICO: 'politico',
  CHEFE_GABINETE: 'chefe_gabinete',
  ASSESSOR: 'assessor',
  EQUIPE: 'equipe',
  OBSERVADOR: 'observador',
} as const;

export const PROFILE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const;

export const AGENDA_STATUS = {
  PROPOSED: 'proposed',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
} as const;

export const POLITICIAN_PRESENCE = {
  POLITICIAN: 'politician',
  REPRESENTATIVE: 'representative',
  NONE: 'none',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PAID: 'paid',
  CANCELLED: 'cancelled',
} as const;

export const TRANSACTION_TYPE = {
  EXPENSE: 'expense',
  REVENUE: 'revenue',
} as const;

export const PAYMENT_METHODS = {
  PIX: 'pix',
  TRANSFER: 'transfer',
  BOLETO: 'boleto',
  CARD: 'card',
} as const;

export const RECEIPT_TYPES = {
  PIX: 'pix',
  INVOICE: 'invoice',
  NF: 'nf',
  RECEIPT: 'receipt',
} as const;

export const NOTIFICATION_MODULES = {
  AGENDA: 'agenda',
  FINANCIAL: 'financial',
  SYSTEM: 'system',
} as const;
