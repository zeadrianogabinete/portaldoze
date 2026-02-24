import { Link, useMatchRoute } from '@tanstack/react-router';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRight, ChevronDown, LogOut, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePermission } from '@/shared/hooks/usePermission';
import { Badge } from '@/shared/components/ui/Badge';
import {
  navGroups,
  configItems,
  type NavGroup,
} from '@/shared/config/navigation';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { profile, logout } = useAuth();
  const { can } = usePermission();
  const matchRoute = useMatchRoute();

  const isActive = (href: string) => {
    if (href === '#') return false;
    return !!matchRoute({ to: href, fuzzy: true });
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isActive(item.href));
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-white/10 bg-[var(--sidebar-bg)] shadow-[var(--shadow-lg)]',
        mobile ? 'w-full' : 'w-[260px]',
      )}
    >
      {/* Logo — texto apenas (a imagem tem fundo claro, não funciona no sidebar escuro) */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-base font-bold text-white shadow-md">
            ZA
          </div>
          <div>
            <h1 className="font-heading text-base font-bold text-white">
              Portal do Zé
            </h1>
            <p className="text-[11px] text-[var(--color-neutral-400)]">
              Deputado Federal
            </p>
          </div>
        </Link>
        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Fechar menu lateral"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Divisória */}
      <div className="mx-3 border-t border-white/10" />

      {/* Menu principal com grupos colapsáveis */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {navGroups.map((group) => {
            if (
              group.permission &&
              !can(group.permission.resource, group.permission.action)
            ) {
              return null;
            }

            return (
              <SidebarGroup
                key={group.title}
                group={group}
                groupActive={isGroupActive(group)}
                isActive={isActive}
                onClose={onClose}
              />
            );
          })}
        </div>

        {/* Seção Configurar */}
        <div className="my-4 border-t border-white/10" />
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
          Configurar
        </p>

        {configItems.map((item) => {
          if (!can(item.permission.resource, item.permission.action))
            return null;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'border-l-[3px] border-primary-400 bg-primary-500/20 text-white'
                  : 'text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white',
              )}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer — User info */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {profile?.full_name}
            </p>
            <p className="truncate text-xs text-[var(--color-neutral-400)]">
              {profile?.role}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-neutral-400)] transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Sair da conta"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
}

/** Componente interno para cada grupo colapsável */
function SidebarGroup({
  group,
  groupActive,
  isActive,
  onClose,
}: {
  group: NavGroup;
  groupActive: boolean;
  isActive: (href: string) => boolean;
  onClose?: () => void;
}) {
  if (group.disabled) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 opacity-90">
        <div className="mb-1.5 flex items-center gap-3 text-[var(--sidebar-text)]">
          <group.icon size={18} strokeWidth={1.5} className="shrink-0" />
          <span className="flex-1 text-sm font-medium">{group.title}</span>
          <Badge variant="neutral" className="border-white/10 bg-white/5 text-[10px] text-[var(--color-neutral-400)]">
            Em breve
          </Badge>
        </div>
        <p className="pl-8 text-xs text-[var(--color-neutral-500)]">
          Módulo em planejamento.
        </p>
      </div>
    );
  }

  return (
    <Collapsible.Root
      defaultOpen={groupActive}
      className="group/collapsible"
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
            'text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white',
            groupActive && 'bg-white/[0.04] text-white',
          )}
        >
          <group.icon size={18} strokeWidth={1.5} className="shrink-0" />
          <span className="flex-1 text-left">{group.title}</span>
          <ChevronRight
            size={14}
            strokeWidth={2}
            className="shrink-0 text-[var(--color-neutral-500)] transition-transform group-data-[state=open]/collapsible:hidden"
          />
          <ChevronDown
            size={14}
            strokeWidth={2}
            className="shrink-0 text-[var(--color-neutral-500)] group-data-[state=closed]/collapsible:hidden"
          />
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="ml-[18px] space-y-0.5 border-l border-white/10 py-1 pl-4">
          {group.items.map((subItem) => {
            const active = isActive(subItem.href);
            return (
              <Link
                key={subItem.href}
                to={subItem.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150',
                  active
                    ? 'bg-primary-500/15 text-white'
                    : 'text-[var(--color-neutral-400)] hover:bg-white/5 hover:text-[var(--color-neutral-200)]',
                )}
              >
                <subItem.icon size={14} strokeWidth={1.5} className="shrink-0" />
                {subItem.title}
              </Link>
            );
          })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
