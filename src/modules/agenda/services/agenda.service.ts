import { supabase } from '@/shared/services/supabase';
import type { Agenda, CreateAgendaInput, AgendaAttendee } from '../types/agenda.types';

export const agendaService = {
  async list(startDate: Date, endDate: Date): Promise<Agenda[]> {
    const { data, error } = await supabase
      .from('agend_eventos')
      .select('*')
      .gte('inicio_em', startDate.toISOString())
      .lte('inicio_em', endDate.toISOString())
      .order('inicio_em', { ascending: true });

    if (error) throw error;
    return data as Agenda[];
  },

  async getById(id: string): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agend_eventos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async create(input: CreateAgendaInput): Promise<Agenda> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    const { data, error } = await supabase
      .from('agend_eventos')
      .insert({
        ...input,
        criado_por: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async update(id: string, input: Partial<CreateAgendaInput>): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agend_eventos')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agend_eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async approve(
    id: string,
    presence: 'politician' | 'representative' | 'none',
    representativeName?: string,
  ): Promise<Agenda> {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    const { data, error } = await supabase
      .from('agend_eventos')
      .update({
        situacao: 'approved',
        aprovado_por: userId,
        aprovado_em: new Date().toISOString(),
        presenca_parlamentar: presence,
        nome_representante: representativeName,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async cancel(id: string): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agend_eventos')
      .update({ situacao: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async getProposals(): Promise<Agenda[]> {
    const { data, error } = await supabase
      .from('agend_eventos')
      .select('*')
      .eq('situacao', 'proposed')
      .order('inicio_em', { ascending: true });

    if (error) throw error;
    return data as Agenda[];
  },

  async getAttendees(eventoId: string): Promise<AgendaAttendee[]> {
    const { data, error } = await supabase
      .from('agend_participantes')
      .select('*')
      .eq('evento_id', eventoId);

    if (error) throw error;
    return data as AgendaAttendee[];
  },

  async addAttendee(
    eventoId: string,
    attendee: {
      usuario_id?: string;
      contato_id?: string;
      nome_externo?: string;
      telefone_externo?: string;
      funcao?: string;
    },
  ): Promise<AgendaAttendee> {
    const { data, error } = await supabase
      .from('agend_participantes')
      .insert({ evento_id: eventoId, ...attendee })
      .select()
      .single();

    if (error) throw error;
    return data as AgendaAttendee;
  },

  async removeAttendee(attendeeId: string): Promise<void> {
    const { error } = await supabase
      .from('agend_participantes')
      .delete()
      .eq('id', attendeeId);

    if (error) throw error;
  },
};
