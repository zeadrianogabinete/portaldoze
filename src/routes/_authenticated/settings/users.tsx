import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, UserCheck, UserX, ArrowLeft, Users } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/format';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: 'pending' | 'active' | 'disabled';
  avatar_url: string | null;
  created_at: string;
}

export const Route = createFileRoute('/_authenticated/settings/users')({
  component: Usuarios,
});

function Usuarios() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'all' | 'pending'>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      toast.success('Status atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      toast.success('Perfil atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const filteredUsers = tab === 'pending'
    ? users?.filter((u) => u.status === 'pending')
    : users;

  const pendingCount = users?.filter((u) => u.status === 'pending').length ?? 0;

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    active: 'Ativo',
    disabled: 'Desativado',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    active: 'bg-green-50 text-green-700',
    disabled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    politico: 'Político',
    chefe_gabinete: 'Chefe de Gabinete',
    assessor: 'Assessor',
    equipe: 'Equipe',
    observador: 'Observador',
  };

  return (
    <PageContainer
      title="Usuários"
      subtitle="Gerencie os usuários do sistema"
      actions={
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-[var(--color-neutral-200)]">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'all'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]',
          )}
        >
          Todos ({users?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={cn(
            'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            tab === 'pending'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]',
          )}
        >
          Pendentes ({pendingCount})
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !filteredUsers || filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users size={40} strokeWidth={1.5} />}
          title={tab === 'pending' ? 'Nenhum pendente' : 'Nenhum usuário'}
          description={tab === 'pending' ? 'Não há usuários aguardando aprovação' : 'Nenhum usuário cadastrado'}
        />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-neutral-800)]">{user.full_name}</p>
                    <p className="text-xs text-[var(--color-neutral-500)]">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Role */}
                  <select
                    value={user.role}
                    onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                    className="rounded-lg border border-[var(--color-neutral-200)] bg-white px-2 py-1 text-xs text-[var(--color-neutral-700)] focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {/* Status badge */}
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', statusColors[user.status] ?? '')}>
                    {statusLabels[user.status] ?? user.status}
                  </span>
                  {/* Actions */}
                  {user.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateStatus.mutate({ id: user.id, status: 'active' })}
                        className="rounded-lg bg-green-50 p-1.5 text-green-600 transition-colors hover:bg-green-100"
                        title="Aprovar"
                      >
                        <Check size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus.mutate({ id: user.id, status: 'disabled' })}
                        className="rounded-lg bg-red-50 p-1.5 text-[var(--color-error)] transition-colors hover:bg-red-100"
                        title="Rejeitar"
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                  {user.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => updateStatus.mutate({ id: user.id, status: 'disabled' })}
                      className="rounded-lg bg-red-50 p-1.5 text-[var(--color-error)] transition-colors hover:bg-red-100"
                      title="Desativar"
                    >
                      <UserX size={14} strokeWidth={1.5} />
                    </button>
                  )}
                  {user.status === 'disabled' && (
                    <button
                      type="button"
                      onClick={() => updateStatus.mutate({ id: user.id, status: 'active' })}
                      className="rounded-lg bg-green-50 p-1.5 text-green-600 transition-colors hover:bg-green-100"
                      title="Reativar"
                    >
                      <UserCheck size={14} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--color-neutral-400)]">
                Cadastrado em {formatDate(user.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
