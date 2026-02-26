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
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  pauta: z.string().optional(),
  inicio_em: z.string().min(1, 'Data de início é obrigatória'),
  fim_em: z.string().min(1, 'Data de término é obrigatória'),
  dia_inteiro: z.boolean(),
  local_nome: z.string().optional(),
  local_endereco: z.string().optional(),
  situacao: z.enum(['proposed', 'approved']),
  presenca_parlamentar: z.enum(['politician', 'representative', 'none']),
  nome_representante: z.string().optional(),
  notas_assessoria: z.string().optional(),
  cor: z.string().optional(),
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
      inicio_em: defaultStart,
      fim_em: defaultEnd,
      dia_inteiro: false,
      situacao: can('agenda', 'approve') ? 'approved' : 'proposed',
      presenca_parlamentar: 'politician',
    },
  });

  const watchPresence = watch('presenca_parlamentar');
  const watchAllDay = watch('dia_inteiro');

  const onSubmit = (data: AgendaFormData) => {
    const startDate = new Date(data.inicio_em);
    const endDate = new Date(data.fim_em);

    create.mutate(
      {
        ...data,
        inicio_em: startDate.toISOString(),
        fim_em: endDate.toISOString(),
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
        className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]"
      >
        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">
            Título <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            {...register('titulo')}
            className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Título do compromisso"
          />
          {errors.titulo && <p className="text-xs text-[var(--color-error)]">{errors.titulo.message}</p>}
        </div>

        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Descrição</label>
          <textarea
            {...register('descricao')}
            rows={3}
            className="flex min-h-[80px] w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Detalhes do compromisso"
          />
        </div>

        {/* Pauta */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Pauta</label>
          <input
            {...register('pauta')}
            className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] transition-colors placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            placeholder="Tema da pauta"
          />
        </div>

        {/* Dia inteiro */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('dia_inteiro')}
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
              {...register('inicio_em')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.inicio_em && <p className="text-xs text-[var(--color-error)]">{errors.inicio_em.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">
              Término <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type={watchAllDay ? 'date' : 'datetime-local'}
              {...register('fim_em')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.fim_em && <p className="text-xs text-[var(--color-error)]">{errors.fim_em.message}</p>}
          </div>
        </div>

        {/* Local */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Local</label>
            <input
              {...register('local_nome')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Nome do local"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-neutral-700)]">Endereço</label>
            <input
              {...register('local_endereco')}
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
              {...register('situacao')}
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
            {...register('presenca_parlamentar')}
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
              {...register('nome_representante')}
              className="flex h-10 w-full rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Nome completo"
            />
          </div>
        )}

        {/* Notas */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-neutral-700)]">Notas da Assessoria</label>
          <textarea
            {...register('notas_assessoria')}
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
            {...register('cor')}
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
