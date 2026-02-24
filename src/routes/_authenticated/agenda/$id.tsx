import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { ArrowLeft, MapPin, User, Clock, Calendar, Edit2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAgendaDetail, useAgendaMutations } from '@/modules/agenda/hooks/useAgendas';
import { usePermission } from '@/shared/hooks/usePermission';
import { LoadingPage } from '@/shared/components/feedback/LoadingSpinner';
import { cn } from '@/shared/utils/cn';

export const Route = createFileRoute('/_authenticated/agenda/$id')({
  component: AgendaDetalhe,
});

function AgendaDetalhe() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: agenda, isLoading } = useAgendaDetail(id);
  const { approve, remove } = useAgendaMutations();
  const { can } = usePermission();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <LoadingPage />;
  if (!agenda) return null;

  const statusLabels: Record<string, string> = {
    proposed: 'Proposta',
    approved: 'Aprovada',
    cancelled: 'Cancelada',
  };
  const statusColors: Record<string, string> = {
    proposed: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-primary-50 text-primary-700',
    cancelled: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]',
  };

  const presenceLabels: Record<string, string> = {
    politician: 'Político presente',
    representative: 'Representante',
    none: 'Sem presença',
  };

  const handleApprove = () => {
    approve.mutate(
      { id: agenda.id, presence: agenda.politician_presence },
      { onSuccess: () => navigate({ to: '/agenda' }) },
    );
  };

  const handleDelete = () => {
    remove.mutate(agenda.id, { onSuccess: () => navigate({ to: '/agenda' }) });
  };

  return (
    <PageContainer
      title={agenda.title}
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
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', statusColors[agenda.status])}>
            {statusLabels[agenda.status]}
          </span>
        </div>

        {/* Card principal */}
        <div className="rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
          {agenda.description && (
            <p className="mb-4 text-sm text-[var(--color-neutral-600)]">{agenda.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <Calendar size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
              <span>
                {format(new Date(agenda.start_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <Clock size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
              <span>
                {format(new Date(agenda.start_at), 'HH:mm')} - {format(new Date(agenda.end_at), 'HH:mm')}
              </span>
            </div>
            {agenda.location_name && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
                <MapPin size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
                <span>
                  {agenda.location_name}
                  {agenda.location_address && ` — ${agenda.location_address}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <User size={16} strokeWidth={1.5} className="text-[var(--color-neutral-400)]" />
              <span>
                {presenceLabels[agenda.politician_presence]}
                {agenda.representative_name && `: ${agenda.representative_name}`}
              </span>
            </div>
          </div>

          {agenda.agenda_topic && (
            <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Pauta</h4>
              <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{agenda.agenda_topic}</p>
            </div>
          )}

          {agenda.advisory_notes && (
            <div className="mt-4 border-t border-[var(--color-neutral-100)] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Notas da Assessoria</h4>
              <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{agenda.advisory_notes}</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          {can('agenda', 'update') && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
            >
              <Edit2 size={14} strokeWidth={1.5} />
              Editar
            </button>
          )}
          {can('agenda', 'approve') && agenda.status === 'proposed' && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approve.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--color-accent-green)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle size={14} strokeWidth={1.5} />
              Aprovar
            </button>
          )}
          {can('agenda', 'approve') && agenda.status === 'approved' && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-[var(--color-neutral-100)] px-3 py-2 text-sm font-semibold text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-200)]"
            >
              <XCircle size={14} strokeWidth={1.5} />
              Cancelar Agenda
            </button>
          )}
          {can('agenda', 'delete') && (
            <>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-[var(--color-error)] transition-colors hover:bg-red-100"
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Excluir
              </button>
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)]">
                  <div className="mx-4 max-w-md rounded-lg border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-lg)]">
                    <h3 className="font-heading text-lg font-semibold text-[var(--color-neutral-800)]">
                      Excluir agenda?
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
                      Esta ação não pode ser desfeita. A agenda será permanentemente removida.
                    </p>
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--color-neutral-700)]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={remove.isPending}
                        className="rounded-xl bg-[var(--color-error)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {remove.isPending ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
