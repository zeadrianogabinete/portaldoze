import { Link, useMatchRoute } from '@tanstack/react-router';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Plus, Minus, LogOut, X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePermission } from '@/shared/hooks/usePermission';
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
        'flex h-full flex-col bg-[var(--sidebar-bg)]',
        mobile ? 'w-full' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <img
            src="/LOGO.png"
            alt="Logo Portal do Zé"
            className="h-8 w-auto"
          />
          <div>
            <h1 className="font-heading text-lg font-bold text-white">
              Portal do Zé
            </h1>
            <p className="text-xs text-[var(--color-neutral-400)]">
              Deputado Federal
            </p>
          </div>
        </Link>
        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--color-neutral-400)] transition-colors hover:bg-white/5 hover:text-white"
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
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-neutral-500)]">
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
              <item.icon size={20} strokeWidth={1.5} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer — User info */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 overflow-hidden">
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
  return (
    <Collapsible.Root
      defaultOpen={groupActive && !group.disabled}
      disabled={group.disabled}
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          disabled={group.disabled}
          className={cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
            group.disabled
              ? 'cursor-not-allowed opacity-50 text-[var(--sidebar-text)]'
              : 'text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white',
            groupActive && !group.disabled && 'text-white',
          )}
        >
          <group.icon size={20} strokeWidth={1.5} />
          <span className="flex-1 text-left">{group.title}</span>
          {!group.disabled && (
            <>
              <Plus
                size={16}
                strokeWidth={1.5}
                className="text-[var(--color-neutral-500)] group-data-[state=open]:hidden"
              />
              <Minus
                size={16}
                strokeWidth={1.5}
                className="text-[var(--color-neutral-500)] group-data-[state=closed]:hidden"
              />
            </>
          )}
        </button>
      </Collapsible.Trigger>

      {!group.disabled && (
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
          <div className="ml-4 space-y-0.5 border-l border-white/10 py-1 pl-3">
            {group.items.map((subItem) => {
              const active = isActive(subItem.href);
              return (
                <Link
                  key={subItem.href}
                  to={subItem.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                    active
                      ? 'bg-primary-500/15 text-white'
                      : 'text-[var(--color-neutral-400)] hover:bg-white/5 hover:text-[var(--color-neutral-200)]',
                  )}
                >
                  <subItem.icon size={16} strokeWidth={1.5} />
                  {subItem.title}
                </Link>
              );
            })}
          </div>
        </Collapsible.Content>
      )}
    </Collapsible.Root>
  );
}
