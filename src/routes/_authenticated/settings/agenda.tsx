import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/settings/agenda')({
  component: ConfigAgenda,
});

function ConfigAgenda() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings', 'agenda'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('confi_configuracoes')
        .select('*')
        .in('chave', ['agenda_require_approval', 'agenda_default_presence', 'agenda_approvers']);
      if (error) throw error;
      const result: Record<string, string | boolean> = {};
      for (const s of data ?? []) {
        const item = s as { chave: string; valor: string | boolean };
        result[item.chave] = item.valor;
      }
      return result;
    },
  });

  const [requireApproval, setRequireApproval] = useState(true);
  const [defaultPresence, setDefaultPresence] = useState('politician');

  useEffect(() => {
    if (settings) {
      setRequireApproval(Boolean(settings.agenda_require_approval ?? true));
      setDefaultPresence(String(settings.agenda_default_presence ?? 'politician'));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = [
        { chave: 'agenda_require_approval', valor: requireApproval },
        { chave: 'agenda_default_presence', valor: defaultPresence },
      ];
      for (const u of updates) {
        const { error } = await supabase
          .from('confi_configuracoes')
          .upsert({ chave: u.chave, valor: u.valor }, { onConflict: 'chave' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configurações salvas');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return (
    <PageContainer
      title="Configurações de Agenda"
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
      <div className="mx-auto max-w-xl space-y-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">Exigir aprovação</p>
            <p className="text-xs text-[var(--color-neutral-500)]">Novas agendas precisam de aprovação antes de aparecer no calendário</p>
          </div>
          <button
            type="button"
            onClick={() => setRequireApproval(!requireApproval)}
            className={cn(
              'relative inline-flex h-6 w-11 rounded-full transition-colors',
              requireApproval ? 'bg-primary-500' : 'bg-[var(--color-neutral-300)]',
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
                requireApproval ? 'translate-x-[22px]' : 'translate-x-0.5',
              )}
              style={{ marginTop: '2px' }}
            />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Presença padrão</label>
          <select
            value={defaultPresence}
            onChange={(e) => setDefaultPresence(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="politician">Político presente</option>
            <option value="representative">Representante</option>
            <option value="none">Sem presença definida</option>
          </select>
        </div>

        <div className="flex justify-end border-t border-[var(--color-neutral-100)] pt-4">
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            <Save size={14} strokeWidth={1.5} />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
