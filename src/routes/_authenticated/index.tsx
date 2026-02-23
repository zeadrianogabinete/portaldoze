import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Calendar,
  Wallet,
  Settings,
  ArrowRight,
  Bell,
  Zap,
  Target,
  UsersRound,
  TrendingUp,
  MapPin,
  MessageSquare,
  Flag,
} from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useNotifications } from '@/shared/hooks/useNotifications';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});

const statCards = [
  {
    title: 'Meta de Apoiadores',
    value: '75.4%',
    description: 'Meta: 100.000 apoiadores',
    icon: Target,
    color: 'text-primary-500',
  },
  {
    title: 'Equipe',
    value: '1.547',
    description: '+123 esta semana',
    icon: UsersRound,
    color: 'text-[var(--color-accent-green)]',
  },
  {
    title: 'Compromissos',
    value: '12',
    description: 'Próximos 7 dias',
    icon: Calendar,
    color: 'text-[var(--color-accent-cyan)]',
  },
  {
    title: 'Alcance',
    value: '89%',
    description: '+5.2% este mês',
    icon: TrendingUp,
    color: 'text-[var(--color-accent-yellow)]',
  },
];

const featureCards = [
  {
    title: 'Mapa de Ações',
    description: 'Acompanhe onde o Zé está fazendo a diferença',
    icon: MapPin,
    href: '#',
    disabled: true,
  },
  {
    title: 'Mensagens do Zé',
    description: 'Comunicação com apoiadores',
    icon: MessageSquare,
    href: '#',
    disabled: true,
  },
  {
    title: 'Agenda de Ações',
    description: 'Encontros e eventos com o Zé',
    icon: Flag,
    href: '/agenda',
    disabled: false,
  },
];

const recentActivities = [
  { text: 'Novo evento: Café com o Zé', time: 'Há 2 horas' },
  { text: '100 novos apoiadores no Bairro São José', time: 'Há 5 horas' },
  { text: 'Relatório de visitas atualizado', time: 'Há 1 dia' },
];

function DashboardPage() {
  const { profile, can } = useCurrentUser();
  const { unreadCount } = useNotifications();

  const quickLinks = [
    {
      title: 'Agenda',
      description: 'Gerencie compromissos e eventos',
      icon: Calendar,
      href: '/agenda',
      color: 'bg-primary-50 text-primary-600',
      visible: can('agenda', 'view'),
    },
    {
      title: 'Financeiro',
      description: 'Controle orçamentário e cotas',
      icon: Wallet,
      href: '/financial',
      color: 'bg-green-50 text-green-600',
      visible: can('financial', 'view'),
    },
    {
      title: 'Configurações',
      description: 'Usuários, permissões e sistema',
      icon: Settings,
      href: '/settings',
      color: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)]',
      visible: can('settings', 'view'),
    },
    {
      title: 'Notificações',
      description:
        unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas',
      icon: Bell,
      href: '/notifications',
      color: 'bg-yellow-50 text-yellow-600',
      visible: true,
    },
  ];

  return (
    <PageContainer>
      {/* Seção de boas-vindas */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-heading text-3xl font-bold text-[var(--color-neutral-800)]">
            Portal do Zé
          </h1>
          <Zap className="h-7 w-7 text-primary-500" />
        </div>
        <p className="text-[var(--color-neutral-500)]">
          Olá, {profile?.full_name?.split(' ')[0]}! Acompanhe e gerencie o
          mandato do Deputado Federal Zé Adriano.
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-neutral-500)]">
                {card.title}
              </span>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-[var(--color-neutral-800)]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Cards de funcionalidades */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-2">
              <card.icon size={24} className="text-primary-500" />
              <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
                {card.title}
              </h3>
            </div>
            <p className="mb-4 text-sm text-[var(--color-neutral-500)]">
              {card.description}
            </p>
            {card.disabled ? (
              <span className="inline-flex items-center rounded-lg bg-[var(--color-neutral-100)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-400)]">
                Em breve
              </span>
            ) : (
              <Link
                to={card.href}
                className="inline-flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
              >
                Acessar
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Acesso rápido */}
      <h2 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)] mb-4">
        Acesso Rápido
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks
          .filter((link) => link.visible)
          .map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`mb-3 inline-flex rounded-lg p-2.5 ${link.color}`}
              >
                <link.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                {link.description}
              </p>
              <div className="mt-3 flex items-center text-sm font-medium text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
                Acessar <ArrowRight size={14} className="ml-1" />
              </div>
            </Link>
          ))}
      </div>

      {/* Atividades recentes */}
      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)] mb-4">
          Últimas Atividades
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.text} className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-primary-500" />
              <div>
                <p className="text-sm font-medium text-[var(--color-neutral-700)]">
                  {activity.text}
                </p>
                <p className="text-xs text-[var(--color-neutral-400)]">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
