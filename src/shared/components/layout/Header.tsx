import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, Bell, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useTheme } from '@/shared/hooks/useTheme';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-neutral-200)]/80 bg-[var(--surface-card)]/90 backdrop-blur-md">
      <div className="relative flex h-16 items-center justify-between px-4 lg:px-6">
      {/* Esquerda */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)] lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]">
            Portal do Mandato
          </p>
          <h2 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)] lg:text-xl">
            {title || 'Painel Administrativo'}
          </h2>
        </div>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[var(--color-neutral-500)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
          aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {isDark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}
        </button>

        {/* Notificações */}
        <Link
          to="/notifications"
          className="relative rounded-lg p-2 text-[var(--color-neutral-500)] transition-colors hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-700)]"
        >
          <Bell size={20} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar / Menu do usuário */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-1.5 transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className="hidden pr-1 text-sm font-medium text-[var(--color-neutral-700)] md:block">
              {profile?.full_name?.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
                onKeyDown={() => {}}
              />
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] py-1.5 shadow-[var(--shadow-lg)]">
                <div className="border-b border-[var(--color-neutral-100)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    {profile?.email}
                  </p>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-50)]"
                >
                  <Settings size={16} strokeWidth={1.5} />
                  Configurações
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-error)] transition-colors hover:bg-[var(--color-neutral-50)]"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      <div className="w-full">
        <div className="h-[2px] w-full bg-[var(--color-accent-yellow)]/90" />
        <div className="h-[1px] w-full bg-[var(--color-accent-green)]/90" />
      </div>
    </header>
  );
}
