import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAgendaMutations } from '@/modules/agenda/hooks/useAgendas';
import { usePermission } from '@/shared/hooks/usePermission';
import { format } from 'date-fns';

const agendaSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  agenda_topic: z.string().optional(),
  start_at: z.string().min(1, 'Data de início é obrigatória'),
  end_at: z.string().min(1, 'Data de término é obrigatória'),
  all_day: z.boolean(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  status: z.enum(['proposed', 'approved']),
  politician_presence: z.enum(['politician', 'representative', 'none']),
  representative_name: z.string().optional(),
  advisory_notes: z.string().optional(),
  color: z.string().optional(),
});

type AgendaFormData = z.infer<typeof agendaSchema>;

export const Route = createFileRoute('/_authenticated/agenda/new')({
  component: NovaAgenda,
});

function NovaAgenda() {
  const navigate = useNavigate();
  const { create } = useAgendaMutations();
  const { can } = usePermission();

  const now = new Date();
  const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
  const defaultEnd = format(new Date(now.getTime() + 3600000), "yyyy-MM-dd'T'HH:mm");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      start_at: defaultStart,
      end_at: defaultEnd,
      all_day: false,
      status: can('agenda', 'approve') ? 'approved' : 'proposed',
      politician_presence: 'politician',
    },
  });

  const watchPresence = watch('politician_presence');
  const watchAllDay = watch('all_day');

  const onSubmit = (data: AgendaFormData) => {
    const startDate = new Date(data.start_at);
    const endDate = new Date(data.end_at);

    create.mutate(
      {
        ...data,
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
      },
      {
        onSuccess: () => {
          navigate({ to: '/agenda' });
        },
      },
    );
  };

  return (
    <PageContainer
      title="Nova Agenda"
      actions={
        <Link
          to="/agenda"
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]"
      >
        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">
            Título <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            {...register('title')}
            className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Título do compromisso"
          />
          {errors.title && <p className="text-xs text-[var(--color-error)]">{errors.title.message}</p>}
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Descrição</label>
          <textarea
            {...register('description')}
            rows={3}
            className="flex min-h-[80px] w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Detalhes do compromisso"
          />
        </div>

        {/* Pauta */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Pauta</label>
          <input
            {...register('agenda_topic')}
            className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Tema da pauta"
          />
        </div>

        {/* Dia inteiro */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('all_day')}
            className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-primary-500 focus:ring-primary-500"
          />
          <label className="text-sm text-[var(--color-neutral-700)]">Dia inteiro</label>
        </div>

        {/* Datas */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">
              Início <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type={watchAllDay ? 'date' : 'datetime-local'}
              {...register('start_at')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.start_at && <p className="text-xs text-[var(--color-error)]">{errors.start_at.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">
              Término <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type={watchAllDay ? 'date' : 'datetime-local'}
              {...register('end_at')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.end_at && <p className="text-xs text-[var(--color-error)]">{errors.end_at.message}</p>}
          </div>
        </div>

        {/* Local */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Local</label>
            <input
              {...register('location_name')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Nome do local"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Endereço</label>
            <input
              {...register('location_address')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Endereço completo"
            />
          </div>
        </div>

        {/* Status (admin only) */}
        {can('agenda', 'approve') && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Status</label>
            <select
              {...register('status')}
              className="flex h-10 w-full appearance-none rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="proposed">Proposta</option>
              <option value="approved">Aprovada</option>
            </select>
          </div>
        )}

        {/* Presença do político */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Presença do Político</label>
          <select
            {...register('politician_presence')}
            className="flex h-10 w-full appearance-none rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="politician">Político presente</option>
            <option value="representative">Representante</option>
            <option value="none">Sem presença</option>
          </select>
        </div>

        {/* Nome do representante */}
        {watchPresence === 'representative' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Nome do Representante</label>
            <input
              {...register('representative_name')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Nome completo"
            />
          </div>
        )}

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Notas da Assessoria</label>
          <textarea
            {...register('advisory_notes')}
            rows={2}
            className="flex min-h-[60px] w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Observações internas"
          />
        </div>

        {/* Cor */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Cor (opcional)</label>
          <input
            type="color"
            {...register('color')}
            className="h-10 w-14 cursor-pointer rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-1"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 border-t border-[var(--color-neutral-100)] pt-4">
          <Link
            to="/agenda"
            className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            {create.isPending ? 'Salvando...' : 'Salvar Agenda'}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
