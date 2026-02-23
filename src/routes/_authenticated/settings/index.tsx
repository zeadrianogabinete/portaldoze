import { createFileRoute, Link } from '@tanstack/react-router';
import { Users, Shield, Calendar, Wallet, Bell, Settings as SettingsIcon } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { usePermission } from '@/shared/hooks/usePermission';
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';

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
    <PageContainer title="Configurações" subtitle="Gerencie usuários, permissões e parâmetros operacionais do portal">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections
          .filter((s) => s.visible)
          .map((section) => (
            <Card
              key={section.href}
              className="group p-0 transition-all hover:-translate-y-0.5"
            >
              <Link to={section.href} className="block p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex rounded-xl bg-[var(--color-neutral-100)] p-2.5 text-[var(--color-neutral-600)] transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
                    <section.icon size={20} strokeWidth={1.5} />
                  </div>
                  <Badge variant="neutral">Admin</Badge>
                </div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription className="mt-1">{section.description}</CardDescription>
              </Link>
            </Card>
          ))}
      </div>
    </PageContainer>
  );
}
