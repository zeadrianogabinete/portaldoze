import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotifications } from '@/shared/hooks/useNotifications';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-[var(--color-neutral-200)] bg-white px-4 lg:h-16 lg:px-6">
      {/* Esquerda */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)] lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        {title && (
          <h2 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)] lg:text-xl">
            {title}
          </h2>
        )}
      </div>

      {/* Direita */}
      <div className="flex items-center gap-2">
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
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
                onKeyDown={() => {}}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-[var(--color-neutral-200)] bg-white py-1 shadow-lg">
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

      {/* Faixas de acento amarelo + verde */}
      <div className="absolute bottom-0 left-0 w-full">
        <div className="h-[3px] w-full bg-[var(--color-accent-yellow)]" />
        <div className="h-[3px] w-full bg-[var(--color-accent-green)]" />
      </div>
    </header>
  );
}
