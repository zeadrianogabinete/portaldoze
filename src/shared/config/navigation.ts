import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  CalendarDays,
  Wallet,
  CreditCard,
  MessageSquare,
  UsersRound,
  MapPin,
  History,
  Settings,
  LayoutDashboard,
  Target,
  TrendingUp,
  FileText,
  UserRound,
  Vote,
} from 'lucide-react';

export interface NavSubItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  disabled: boolean;
  permission?: { resource: string; action: string };
  items: NavSubItem[];
}

export interface NavConfigItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: { resource: string; action: string };
}

/**
 * Grupos colapsáveis do menu principal.
 * Grupos com disabled=true não possuem rotas no projeto atual
 * e aparecem com opacidade reduzida sem expandir.
 */
export const navGroups: NavGroup[] = [
  {
    title: 'Campanha 2026',
    icon: Zap,
    disabled: true,
    items: [
      { title: 'Visão Geral', href: '#', icon: LayoutDashboard },
      { title: 'Metas e Objetivos', href: '#', icon: Target },
      { title: 'Análise de Desempenho', href: '#', icon: TrendingUp },
    ],
  },
  {
    title: 'Agenda',
    icon: CalendarDays,
    disabled: false,
    permission: { resource: 'agenda', action: 'view' },
    items: [
      { title: 'Compromissos', href: '/agenda', icon: CalendarDays },
      { title: 'Propostas', href: '/agenda/proposals', icon: FileText },
    ],
  },
  {
    title: 'Financeiro',
    icon: Wallet,
    disabled: false,
    permission: { resource: 'financial', action: 'view' },
    items: [
      { title: 'Dashboard', href: '/financial', icon: LayoutDashboard },
      { title: 'Despesas', href: '/financial/expenses', icon: FileText },
      { title: 'Contas a Pagar', href: '/financial/payables', icon: CreditCard },
      { title: 'Receitas', href: '/financial/revenues', icon: TrendingUp },
      { title: 'Fixas', href: '/financial/fixed', icon: Target },
      { title: 'Cotas', href: '/financial/quotas', icon: Vote },
      { title: 'Relatórios', href: '/financial/reports', icon: FileText },
    ],
  },
  {
    title: 'Comunicação',
    icon: MessageSquare,
    disabled: true,
    items: [
      { title: 'Mensagens', href: '#', icon: MessageSquare },
      { title: 'Newsletter', href: '#', icon: FileText },
      { title: 'Redes Sociais', href: '#', icon: UsersRound },
    ],
  },
  {
    title: 'Equipe',
    icon: UsersRound,
    disabled: true,
    items: [
      { title: 'Reuniões', href: '#', icon: CalendarDays },
      { title: 'Demandas', href: '#', icon: FileText },
      { title: 'Pessoas', href: '#', icon: UserRound },
    ],
  },
  {
    title: 'Territórios',
    icon: MapPin,
    disabled: true,
    items: [
      { title: 'Mapa de Ações', href: '#', icon: MapPin },
      { title: 'Bairros', href: '#', icon: LayoutDashboard },
      { title: 'Bases de Apoio', href: '#', icon: Target },
    ],
  },
  {
    title: 'Eleições Anteriores',
    icon: History,
    disabled: true,
    items: [
      { title: 'Visão Geral', href: '#', icon: LayoutDashboard },
      { title: 'Visão Individual', href: '#', icon: UserRound },
      { title: 'Comparativo de Candidatos', href: '#', icon: UsersRound },
      { title: 'Eleitorado', href: '#', icon: Vote },
      { title: 'Manutenção', href: '#', icon: Settings },
    ],
  },
  {
    title: 'Histórico',
    icon: History,
    disabled: true,
    items: [
      { title: 'Atividades', href: '#', icon: CalendarDays },
      { title: 'Relatórios', href: '#', icon: FileText },
      { title: 'Métricas', href: '#', icon: TrendingUp },
    ],
  },
];

/** Item separado de configuração — renderizado após divisória */
export const configItems: NavConfigItem[] = [
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    permission: { resource: 'settings', action: 'view' },
  },
];
