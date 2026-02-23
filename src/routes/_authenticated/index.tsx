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
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { StatCard } from '@/shared/components/ui/StatCard';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage,
});

const statCards = [
  {
    title: 'Meta de Apoiadores',
    value: '75.4%',
    description: 'Meta: 100.000 apoiadores',
    icon: Target,
    tone: 'primary' as const,
  },
  {
    title: 'Equipe',
    value: '1.547',
    description: '+123 esta semana',
    icon: UsersRound,
    tone: 'success' as const,
  },
  {
    title: 'Compromissos',
    value: '12',
    description: 'Próximos 7 dias',
    icon: Calendar,
    tone: 'info' as const,
  },
  {
    title: 'Alcance',
    value: '89%',
    description: '+5.2% este mês',
    icon: TrendingUp,
    tone: 'warning' as const,
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
  const firstName = profile?.full_name?.split(' ')[0] || 'Equipe';

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
      color: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
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
      color: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]',
      visible: true,
    },
  ];

  return (
    <PageContainer>
      <div className="mb-6 rounded-2xl border border-primary-300/30 bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white shadow-[var(--shadow-lg)] lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
              <Zap size={14} />
              Mandato 2026 · Painel Estratégico
            </div>
            <h1 className="font-heading text-2xl font-bold lg:text-3xl">
              Bem-vindo, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85 lg:text-base">
              Acompanhe métricas críticas, próximos compromissos e evolução das frentes do mandato em um único painel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/20 bg-white/15 text-white">
              {unreadCount > 0 ? `${unreadCount} notificações pendentes` : 'Nenhuma pendência crítica'}
            </Badge>
            <Badge className="border-white/20 bg-white/15 text-white">
              Operação ativa
            </Badge>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((card) => (
          <Card
            key={card.title}
            className="p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center gap-2">
              <card.icon size={24} className="text-primary-500" />
              <CardTitle>{card.title}</CardTitle>
              {card.disabled && <Badge variant="neutral">Roadmap</Badge>}
            </div>
            <CardDescription className="mb-4">{card.description}</CardDescription>
            {card.disabled ? (
              <span className="inline-flex items-center rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-500)]">
                Em breve
              </span>
            ) : (
              <Link
                to={card.href}
                className="inline-flex items-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                Acessar
              </Link>
            )}
          </Card>
        ))}
      </div>

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
              className="group rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-md"
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

      <Card className="p-6">
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
      </Card>
    </PageContainer>
  );
}
