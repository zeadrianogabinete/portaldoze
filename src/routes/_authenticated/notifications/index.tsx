import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Bell, CheckCheck, Calendar, Wallet, Settings } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { formatRelativeTime } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import type { NotificationModule } from '@/shared/types/notification.types';
import { Badge } from '@/shared/components/ui/Badge';

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<NotificationModule | 'all'>('all');

  const moduleIcons: Record<NotificationModule, typeof Calendar> = {
    agenda: Calendar,
    financial: Wallet,
    system: Settings,
  };

  const moduleColors: Record<NotificationModule, string> = {
    agenda: 'bg-primary-50 text-primary-600',
    financial: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
    system: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.module === filter);

  const tabs = [
    { label: 'Todas', value: 'all' as const },
    { label: 'Agenda', value: 'agenda' as const },
    { label: 'Financeiro', value: 'financial' as const },
    { label: 'Sistema', value: 'system' as const },
  ];

  return (
    <PageContainer
      title="Notificações"
      subtitle="Central de alertas e atualizações da operação"
      actions={
        unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <CheckCheck size={16} strokeWidth={1.5} />
            Marcar todas como lidas
          </button>
        ) : undefined
      }
    >
      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-1.5 shadow-[var(--shadow-card)]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              filter === tab.value
                ? 'bg-primary-500/12 text-primary-700'
                : 'text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} strokeWidth={1.5} />}
          title="Nenhuma notificação"
          description="Você será notificado sobre eventos importantes"
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const Icon = moduleIcons[notification.module];
            const colorClass = moduleColors[notification.module];
            return (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border p-4 transition-colors shadow-[var(--shadow-xs)]',
                  notification.read
                    ? 'border-[var(--color-neutral-200)] bg-[var(--surface-card)]'
                    : 'border-primary-200 bg-primary-50/30',
                )}
              >
                <div className={cn('mt-0.5 rounded-lg p-2', colorClass)}>
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                      {notification.title}
                    </p>
                    {!notification.read && <Badge>Nova</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--color-neutral-500)]">
                    {notification.body}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="rounded p-1 text-[var(--color-neutral-400)] transition-colors hover:text-primary-500"
                    title="Marcar como lida"
                  >
                    <CheckCheck size={16} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
