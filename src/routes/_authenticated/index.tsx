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
import { motion } from 'framer-motion';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { Card, CardDescription, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { StatCard } from '@/shared/components/ui/StatCard';
import { cn } from '@/shared/utils/cn';

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
    description: 'Acompanhe onde o Zé está fazendo a diferença estrategicamente',
    icon: MapPin,
    href: '#',
    disabled: true,
  },
  {
    title: 'Mensagens do Zé',
    description: 'Comunicação direta e eficiente com seus apoiadores',
    icon: MessageSquare,
    href: '#',
    disabled: true,
  },
  {
    title: 'Agenda de Ações',
    description: 'Encontros e eventos confirmados com o Deputado',
    icon: Flag,
    href: '/agenda',
    disabled: false,
  },
];

const recentActivities = [
  { text: 'Novo evento: Café com o Zé', time: 'Há 2 horas', icon: Calendar },
  { text: '100 novos apoiadores no Bairro São José', time: 'Há 5 horas', icon: UsersRound },
  { text: 'Relatório de visitas atualizado', time: 'Há 1 dia', icon: TrendingUp },
];

function DashboardPage() {
  const { profile, can } = useCurrentUser();
  const { unreadCount } = useNotifications();
  const firstName = profile?.full_name?.split(' ')[0] || 'Equipe';

  const quickLinks = [
    {
      title: 'Agenda',
      description: 'Gerencie compromissos',
      icon: Calendar,
      href: '/agenda',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      visible: can('agenda', 'view'),
    },
    {
      title: 'Financeiro',
      description: 'Controle orçamentário',
      icon: Wallet,
      href: '/financial',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      visible: can('financial', 'view'),
    },
    {
      title: 'Configurações',
      description: 'Acessos e sistema',
      icon: Settings,
      href: '/settings',
      color: 'bg-slate-50 text-slate-600 border-slate-100',
      visible: can('settings', 'view'),
    },
    {
      title: 'Notificações',
      description: unreadCount > 0 ? `${unreadCount} pendentes` : 'Tudo em dia',
      icon: Bell,
      href: '/notifications',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      visible: true,
    },
  ];

  return (
    <PageContainer>
      {/* Hero Banner Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 overflow-hidden rounded-[32px] border border-primary-200/20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-8 text-white relative shadow-2xl shadow-primary-900/20"
      >
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-300/10 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
              <Zap size={14} className="text-amber-400" />
              Painel Estratégico · Mandato 2026
            </div>
            <h1 className="font-heading text-3xl font-bold lg:text-5xl tracking-tight leading-tight">
              Bem-vindo, <span className="text-primary-200">{firstName}</span>
            </h1>
            <p className="mt-4 text-base text-white/70 lg:text-lg font-medium leading-relaxed">
              Monitore métricas críticas, organize compromissos e impulsione a evolução das frentes do seu mandato em tempo real.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Badge className="border-white/10 bg-white/10 text-white backdrop-blur-md px-4 py-2 rounded-2xl">
              {unreadCount > 0 ? `${unreadCount} Pendências Críticas` : 'Zero Pendências'}
            </Badge>
            <Badge className="border-emerald-400/20 bg-emerald-500/20 text-emerald-300 backdrop-blur-md px-4 py-2 rounded-2xl">
              Sistema Operacional Ativo
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-[var(--color-neutral-900)] tracking-tight">
              Atividades do Mandato
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {featureCards.map((card) => (
              <Card
                key={card.title}
                className="group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 border border-primary-100">
                    <card.icon size={24} strokeWidth={2} />
                  </div>
                  <CardTitle className="text-lg font-bold mb-2">{card.title}</CardTitle>
                  <CardDescription className="mb-6 min-h-[40px] leading-relaxed line-clamp-2">
                    {card.description}
                  </CardDescription>
                  {card.disabled ? (
                    <Badge variant="neutral" className="opacity-70">Em breve</Badge>
                  ) : (
                    <Link
                      to={card.href}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:-translate-y-0.5"
                    >
                      Acessar Painel <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-neutral-900)] mb-6 tracking-tight">
            Acesso Rápido
          </h2>
          <div className="grid gap-4">
            {quickLinks
              .filter((link) => link.visible)
              .map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="group flex items-center gap-4 rounded-3xl border border-[var(--color-neutral-200)]/60 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md active:scale-98"
                >
                  <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors', link.color)}>
                    <link.icon size={22} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-neutral-800)] text-sm">
                      {link.title}
                    </h3>
                    <p className="text-xs text-[var(--color-neutral-500)] truncate">
                      {link.description}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)] transition-all group-hover:bg-primary-50 group-hover:text-primary-500">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-neutral-900)] tracking-tight">
              Últimas Campanhas & Atividades
            </h2>
            <p className="text-sm text-[var(--color-neutral-500)] mt-1">Registros recentes de todas as frentes de trabalho</p>
          </div>
          <button className="text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors">Ver histórico completo</button>
        </div>
        <div className="space-y-6">
          {recentActivities.map((activity) => (
            <div key={activity.text} className="flex items-start gap-5 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-neutral-50)] text-[var(--color-neutral-400)] transition-all group-hover:bg-primary-50 group-hover:text-primary-500 border border-[var(--color-neutral-200)]/40">
                <activity.icon size={22} />
              </div>
              <div className="flex-1 pt-0.5 border-b border-[var(--color-neutral-100)] pb-6 last:border-0">
                <p className="text-base font-bold text-[var(--color-neutral-800)] group-hover:text-primary-600 transition-colors">
                  {activity.text}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--color-neutral-400)]">
                  <span>{activity.time}</span>
                  <span>•</span>
                  <span className="text-primary-500/80">Confirmado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
