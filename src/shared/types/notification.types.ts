export type NotificationModule = 'agenda' | 'financial' | 'system';

export type NotificationType =
  | 'agenda_proposed'
  | 'agenda_approved'
  | 'agenda_reminder'
  | 'transaction_due'
  | 'transaction_overdue'
  | 'user_registered'
  | 'user_approved'
  | 'system_generic';

export interface Notification {
  id: string;
  usuario_id: string;
  modulo: NotificationModule;
  tipo: NotificationType;
  titulo: string;
  corpo: string;
  dados: Record<string, unknown>;
  lida: boolean;
  lida_em: string | null;
  criado_em: string;
}

export interface NotificationPreferences {
  usuario_id: string;
  agenda_in_app: boolean;
  agenda_push: boolean;
  financeiro_in_app: boolean;
  financeiro_push: boolean;
  sistema_in_app: boolean;
  sistema_push: boolean;
  atualizado_em: string;
}

export interface PushSubscriptionData {
  id: string;
  usuario_id: string;
  endpoint: string;
  chaves: {
    p256dh: string;
    auth: string;
  };
  user_agent: string | null;
  criado_em: string;
}
