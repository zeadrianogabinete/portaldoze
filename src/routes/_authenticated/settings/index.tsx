import { createFileRoute, Link } from '@tanstack/react-router';
import { Users, Shield, Calendar, Wallet, Bell, Settings as SettingsIcon } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { usePermission } from '@/shared/hooks/usePermission';

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
});

function SettingsPage() {
  const { can } = usePermission();

  const sections = [
    {
      title: 'Sistema',
      description: 'Informações gerais e político principal',
      icon: SettingsIcon,
      href: '/settings',
      visible: can('settings', 'view'),
    },
    {
      title: 'Usuários',
      description: 'Gestão de usuários e fila de aprovação',
      icon: Users,
      href: '/settings/users',
      visible: can('settings.users', 'manage'),
    },
    {
      title: 'Permissões',
      description: 'Perfis e matriz de permissões',
      icon: Shield,
      href: '/settings/permissions',
      visible: can('settings.permissions', 'manage'),
    },
    {
      title: 'Agenda',
      description: 'Configurações do módulo de agenda',
      icon: Calendar,
      href: '/settings/agenda',
      visible: can('settings', 'manage'),
    },
    {
      title: 'Financeiro',
      description: 'Naturezas, fontes, cotas e contas',
      icon: Wallet,
      href: '/settings/financial',
      visible: can('settings', 'manage'),
    },
    {
      title: 'Notificações',
      description: 'Preferências de notificação',
      icon: Bell,
      href: '/settings/notifications',
      visible: true,
    },
  ];

  return (
    <PageContainer title="Configurações" subtitle="Gerencie o sistema e suas preferências">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections
          .filter((s) => s.visible)
          .map((section) => (
            <Link
              key={section.href}
              to={section.href}
              className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 inline-flex rounded-lg bg-[var(--color-neutral-100)] p-2.5 text-[var(--color-neutral-600)] transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                <section.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                {section.description}
              </p>
            </Link>
          ))}
      </div>
    </PageContainer>
  );
}
