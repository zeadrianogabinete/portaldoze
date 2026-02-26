import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '@/shared/components/layout/AppShell';
import { useAuth } from '@/shared/hooks/useAuth';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';
import { ShieldX, Clock } from 'lucide-react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoading, isAuthenticated, profile } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    // Redirect para login
    window.location.href = '/login';
    return <LoadingPage />;
  }

  // Usuário pendente
  if (profile?.situacao === 'pending') {
    return <PendingApproval />;
  }

  // Usuário desativado
  if (profile?.situacao === 'disabled') {
    return <DisabledAccount />;
  }

  return <AppShell />;
}

function PendingApproval() {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--surface-page)]">
      <div className="mx-4 max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <Clock size={48} className="mx-auto mb-4 text-[var(--color-accent-yellow)]" strokeWidth={1.5} />
        <h2 className="font-heading text-xl font-bold text-[var(--color-neutral-800)]">
          Aguardando aprovação
        </h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
          Seu cadastro está em análise. Você será notificado quando um administrador aprovar seu acesso.
        </p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-200)]"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

function DisabledAccount() {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--surface-page)]">
      <div className="mx-4 max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <ShieldX size={48} className="mx-auto mb-4 text-[var(--color-error)]" strokeWidth={1.5} />
        <h2 className="font-heading text-xl font-bold text-[var(--color-neutral-800)]">
          Conta desativada
        </h2>
        <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
          Sua conta foi desativada. Entre em contato com o administrador do sistema.
        </p>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)] px-4 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-200)]"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
