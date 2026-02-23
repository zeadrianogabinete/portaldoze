import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { agendaService } from '../services/agenda.service';
import type { CreateAgendaInput } from '../types/agenda.types';

interface UseAgendasOptions {
  startDate: Date;
  endDate: Date;
}

export function useAgendas({ startDate, endDate }: UseAgendasOptions) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['agendas', startDate.toISOString(), endDate.toISOString()],
    queryFn: () => agendaService.list(startDate, endDate),
  });

  return {
    agendas: data ?? [],
    isLoading,
    error,
  };
}

export function useAgendaDetail(id: string) {
  return useQuery({
    queryKey: ['agenda', id],
    queryFn: () => agendaService.getById(id),
    enabled: !!id,
  });
}

export function useAgendaProposals() {
  return useQuery({
    queryKey: ['agendas', 'proposals'],
    queryFn: () => agendaService.getProposals(),
  });
}

export function useAgendaMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateAgendaInput) => agendaService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar agenda: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateAgendaInput> }) =>
      agendaService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda atualizada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agendaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda excluída');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      presence,
      representativeName,
    }: {
      id: string;
      presence: 'politician' | 'representative' | 'none';
      representativeName?: string;
    }) => agendaService.approve(id, presence, representativeName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      toast.success('Agenda aprovada');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao aprovar: ${error.message}`);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    remove: deleteMutation,
    approve: approveMutation,
  };
}
