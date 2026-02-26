import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, Bell, LogOut, Settings, Moon, Sun, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/hooks/useAuth';
import { useNotifications } from '@/shared/hooks/useNotifications';
import { useTheme } from '@/shared/hooks/useTheme';
import { usePageContext } from '@/shared/context/PageContext';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const { pageTitle, breadcrumbs } = usePageContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const closeUserMenu = useCallback(() => setShowUserMenu(false), []);

  // Fechar menu com Escape
  useEffect(() => {
    if (!showUserMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUserMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUserMenu, closeUserMenu]);

  const displayTitle = title || pageTitle || 'Painel Administrativo';
  const hasBreadcrumbs = breadcrumbs.length > 0;

  return (
    <header className="sticky top-0 z-30 relative border-b border-neutral-200/40 bg-surface-card/85 backdrop-blur-xl shadow-header">
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg p-2.5 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-800 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={22} strokeWidth={2} />
            </button>
          )}
          <div className="flex flex-col">
            {hasBreadcrumbs ? (
              <nav className="hidden items-center gap-1.5 text-[11px] font-medium text-neutral-400 sm:flex mb-0.5">
                <Link to="/" className="hover:text-neutral-600 transition-colors">
                  Painel
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-neutral-300" />
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-neutral-600 transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-neutral-600">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : (
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 sm:block leading-tight">
                Gestão de Mandato
              </p>
            )}
            <h2 className="font-heading text-lg font-bold text-neutral-900 sm:text-xl tracking-tight">
              {displayTitle}
            </h2>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2.5 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-primary-500"
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative rounded-lg p-2.5 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-primary-500 group"
          >
            <Bell size={20} className="transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-surface-card">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-surface-card p-1 pr-3 shadow-sm transition-all hover:border-primary-200 hover:shadow-md active:scale-95"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white shadow-md shadow-primary-500/10">
                {profile?.nome_completo?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-bold text-neutral-800 leading-none">
                  {profile?.nome_completo?.split(' ')[0]}
                </span>
                <span className="text-[10px] font-medium text-neutral-400 mt-0.5">
                  {profile?.papel}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-40"
                  onClick={closeUserMenu}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-neutral-200/80 bg-surface-card p-2 shadow-float backdrop-blur-sm"
                  role="menu"
                >
                  <div className="px-4 py-3 mb-2">
                    <p className="text-sm font-bold text-neutral-900">
                      {profile?.nome_completo}
                    </p>
                    <p className="text-[11px] font-medium text-neutral-500 truncate">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="h-px bg-neutral-100 mx-2 mb-2" />
                  <Link
                    to="/settings"
                    onClick={closeUserMenu}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-neutral-600 transition-all rounded-lg hover:bg-primary-500/10 hover:text-primary-500 group"
                    role="menuitem"
                  >
                    <Settings size={18} className="transition-transform group-hover:rotate-45" />
                    Configurações
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeUserMenu();
                      logout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 transition-all rounded-lg hover:bg-red-500/10"
                    role="menuitem"
                  >
                    <LogOut size={18} />
                    Sair da conta
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Faixas de identidade visual */}
      <div className="absolute bottom-0 left-0 w-full">
        <div className="h-[3px] w-full bg-accent-yellow" />
        <div className="h-[3px] w-full bg-accent-green" />
      </div>
    </header>
  );
}
