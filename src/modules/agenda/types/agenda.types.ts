export interface Agenda {
  id: string;
  titulo: string;
  descricao: string | null;
  pauta: string | null;
  inicio_em: string;
  fim_em: string;
  dia_inteiro: boolean;
  regra_recorrencia: RecurrenceRule | null;
  recorrencia_pai_id: string | null;
  excecao_recorrencia: boolean;
  local_nome: string | null;
  local_endereco: string | null;
  local_lat: number | null;
  local_lng: number | null;
  local_place_id: string | null;
  situacao: 'proposed' | 'approved' | 'cancelled';
  aprovado_por: string | null;
  aprovado_em: string | null;
  presenca_parlamentar: 'politician' | 'representative' | 'none';
  nome_representante: string | null;
  notas_assessoria: string | null;
  criado_por: string;
  cor: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface AgendaAttendee {
  id: string;
  evento_id: string;
  usuario_id: string | null;
  contato_id: string | null;
  nome_externo: string | null;
  telefone_externo: string | null;
  funcao: 'admin' | 'member' | 'observer';
  confirmacao: 'pending' | 'accepted' | 'declined' | 'tentative';
  criado_em: string;
}

export interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  byDay?: string[];
  byMonthDay?: number;
  until?: string;
  count?: number;
}

export interface AgendaFilters {
  startDate: Date;
  endDate: Date;
  status?: string;
  presence?: string;
}

export interface CreateAgendaInput {
  titulo: string;
  descricao?: string;
  pauta?: string;
  inicio_em: string;
  fim_em: string;
  dia_inteiro?: boolean;
  regra_recorrencia?: RecurrenceRule;
  local_nome?: string;
  local_endereco?: string;
  local_lat?: number;
  local_lng?: number;
  local_place_id?: string;
  situacao?: 'proposed' | 'approved';
  presenca_parlamentar?: 'politician' | 'representative' | 'none';
  nome_representante?: string;
  notas_assessoria?: string;
  cor?: string;
}
