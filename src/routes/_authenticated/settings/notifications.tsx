import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAuth } from '@/shared/hooks/useAuth';

interface NotificationPref {
  module: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
}

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: ConfigNotificacoes,
});

function ConfigNotificacoes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['settings', 'notification-prefs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notif_preferencias')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data as NotificationPref[];
    },
    enabled: !!user,
  });

  const [localPrefs, setLocalPrefs] = useState<NotificationPref[]>([]);

  useEffect(() => {
    if (prefs) setLocalPrefs(prefs);
  }, [prefs]);

  const togglePref = (module: string, field: keyof NotificationPref) => {
    setLocalPrefs((prev) =>
      prev.map((p) =>
        p.module === module ? { ...p, [field]: !p[field] } : p,
      ),
    );
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const pref of localPrefs) {
        const { error } = await supabase
          .from('notif_preferencias')
          .update({
            email_enabled: pref.email_enabled,
            push_enabled: pref.push_enabled,
            in_app_enabled: pref.in_app_enabled,
          })
          .eq('user_id', user?.id)
          .eq('module', pref.module);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notification-prefs'] });
      toast.success('Preferências salvas');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const moduleLabels: Record<string, string> = {
    agenda: 'Agenda',
    financial: 'Financeiro',
    system: 'Sistema',
  };

  return (
    <PageContainer
      title="Notificações"
      subtitle="Configure suas preferências de notificação"
      actions={
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-4">
          <div className="overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]/70">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Módulo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">In-App</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Push</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {localPrefs.map((pref) => (
                  <tr key={pref.module}>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-neutral-800)]">
                      {moduleLabels[pref.module] ?? pref.module}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={pref.in_app_enabled}
                        onChange={() => togglePref(pref.module, 'in_app_enabled')}
                        className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500"
                        aria-label={`Ativar notificações in-app para ${moduleLabels[pref.module] ?? pref.module}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={pref.push_enabled}
                        onChange={() => togglePref(pref.module, 'push_enabled')}
                        className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500"
                        aria-label={`Ativar notificações push para ${moduleLabels[pref.module] ?? pref.module}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={pref.email_enabled}
                        onChange={() => togglePref(pref.module, 'email_enabled')}
                        className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500"
                        aria-label={`Ativar notificações por email para ${moduleLabels[pref.module] ?? pref.module}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              <Save size={14} strokeWidth={1.5} />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
