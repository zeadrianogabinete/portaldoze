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
  user_id: string;
  module: NotificationModule;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  agenda_in_app: boolean;
  agenda_push: boolean;
  financial_in_app: boolean;
  financial_push: boolean;
  system_in_app: boolean;
  system_push: boolean;
  updated_at: string;
}

export interface PushSubscriptionData {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent: string | null;
  created_at: string;
}
