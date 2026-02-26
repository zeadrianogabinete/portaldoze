import { Link, useMatchRoute } from '@tanstack/react-router';
import * as Collapsible from '@radix-ui/react-collapsible';
import { motion } from 'framer-motion';
import { ChevronDown, LogOut, X } from 'lucide-react';
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
        'flex h-full flex-col border-r border-white/5 bg-sidebar text-sidebar-text shadow-float transition-all duration-300',
        mobile ? 'w-full' : 'w-[280px]',
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-8">
        <Link to="/" onClick={onClose} className="flex items-center gap-3.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-lg font-bold text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105">
            ZA
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-lg font-bold tracking-tight text-white leading-tight">
              Portal do Zé
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-400/80">
              Deputado Federal
            </p>
          </div>
        </Link>
        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-sidebar-text transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fechar menu lateral"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-sidebar">
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

        {/* Config Section */}
        <div className="pt-5 border-t border-white/10">
          <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-muted">
            Configurar
          </p>
          <div className="space-y-1">
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
                    'group flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary-500/10 text-primary-400 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]'
                      : 'text-sidebar-text hover:bg-white/5 hover:text-white',
                  )}
                >
                  <item.icon size={19} className={cn('transition-colors', active ? 'text-primary-400' : 'text-sidebar-text group-hover:text-white')} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 bg-white/[0.03] border-t border-white/8">
        <div className="flex items-center gap-3.5 rounded-lg bg-white/[0.05] p-3.5 border border-white/8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-500 to-primary-400 text-sm font-bold text-white shadow-md">
            {profile?.nome_completo?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {profile?.nome_completo}
            </p>
            <p className="truncate text-[11px] font-medium text-sidebar-text">
              {profile?.papel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-text transition-all hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
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
      <div className="px-4 py-3 rounded-lg">
        <div className="flex items-center gap-3.5 text-sidebar-muted">
          <group.icon size={19} className="shrink-0 text-sidebar-muted" />
          <span className="flex-1 truncate text-sm font-medium">{group.title}</span>
          <Badge variant="neutral" className="shrink-0 border-white/8 bg-white/5 text-sidebar-muted text-[9px] font-semibold tracking-wide py-0.5 px-2">
            EM BREVE
          </Badge>
        </div>
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
            'flex w-full items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group/btn',
            'text-sidebar-text hover:bg-white/5 hover:text-white',
            groupActive && 'bg-white/[0.06] text-white',
          )}
        >
          <group.icon size={19} className={cn('shrink-0 transition-colors', groupActive ? 'text-primary-400' : 'text-sidebar-text group-hover/btn:text-white')} />
          <span className="flex-1 text-left">{group.title}</span>
          <ChevronDown
            size={16}
            className="shrink-0 text-sidebar-text transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[state=open]/collapsible:rotate-0"
          />
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="ml-5 mt-1.5 space-y-0.5 border-l border-white/8 py-1.5 pl-3">
          {group.items.map((subItem) => {
            const active = isActive(subItem.href);
            return (
              <Link
                key={subItem.href}
                to={subItem.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                  active
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-sidebar-text hover:bg-white/5 hover:text-white',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-sub-active"
                    className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-primary-500"
                  />
                )}
                <span className="truncate">{subItem.title}</span>
              </Link>
            );
          })}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
