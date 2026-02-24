import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { useAgendaProposals, useAgendaMutations } from '@/modules/agenda/hooks/useAgendas';
import { EmptyState } from '@/shared/components/feedback/EmptyState';

export const Route = createFileRoute('/_authenticated/agenda/proposals')({
  component: PropostasDeAgenda,
});

function PropostasDeAgenda() {
  const { data: proposals, isLoading } = useAgendaProposals();
  const { approve } = useAgendaMutations();

  const presenceLabels: Record<string, string> = {
    politician: 'Político presente',
    representative: 'Representante',
    none: 'Sem presença',
  };

  return (
    <PageContainer
      title="Propostas de Agenda"
      subtitle="Agendas aguardando aprovação"
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
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-500" />
        </div>
      ) : !proposals || proposals.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} strokeWidth={1.5} />}
          title="Nenhuma proposta"
          description="Não há agendas pendentes de aprovação"
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="rounded-2xl border border-[var(--color-neutral-200)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-heading text-base font-semibold text-[var(--color-neutral-800)]">
                    {proposal.title}
                  </h3>
                  {proposal.description && (
                    <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{proposal.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-neutral-500)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} strokeWidth={1.5} />
                      {format(new Date(proposal.start_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} strokeWidth={1.5} />
                      {format(new Date(proposal.start_at), 'HH:mm')} - {format(new Date(proposal.end_at), 'HH:mm')}
                    </span>
                    {proposal.location_name && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} strokeWidth={1.5} />
                        {proposal.location_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User size={12} strokeWidth={1.5} />
                      {presenceLabels[proposal.politician_presence]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/agenda/$id"
                    params={{ id: proposal.id }}
                    className="rounded-xl border border-[var(--color-neutral-200)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--color-neutral-600)] transition-colors hover:bg-[var(--color-neutral-100)]"
                  >
                    Detalhes
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      approve.mutate({ id: proposal.id, presence: proposal.politician_presence });
                    }}
                    disabled={approve.isPending}
                    className="flex items-center gap-1 rounded-xl bg-[var(--color-accent-green)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle size={12} strokeWidth={1.5} />
                    Aprovar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
