import { supabase } from '@/shared/services/supabase';
import type { Agenda, CreateAgendaInput, AgendaAttendee } from '../types/agenda.types';

export const agendaService = {
  async list(startDate: Date, endDate: Date): Promise<Agenda[]> {
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .gte('start_at', startDate.toISOString())
      .lte('start_at', endDate.toISOString())
      .order('start_at', { ascending: true });

    if (error) throw error;
    return data as Agenda[];
  },

  async getById(id: string): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agendas')
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
      .from('agendas')
      .insert({
        ...input,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async update(id: string, input: Partial<CreateAgendaInput>): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agendas')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agendas')
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
      .from('agendas')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        politician_presence: presence,
        representative_name: representativeName,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async cancel(id: string): Promise<Agenda> {
    const { data, error } = await supabase
      .from('agendas')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Agenda;
  },

  async getProposals(): Promise<Agenda[]> {
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .eq('status', 'proposed')
      .order('start_at', { ascending: true });

    if (error) throw error;
    return data as Agenda[];
  },

  async getAttendees(agendaId: string): Promise<AgendaAttendee[]> {
    const { data, error } = await supabase
      .from('agenda_attendees')
      .select('*')
      .eq('agenda_id', agendaId);

    if (error) throw error;
    return data as AgendaAttendee[];
  },

  async addAttendee(
    agendaId: string,
    attendee: {
      user_id?: string;
      contact_id?: string;
      external_name?: string;
      external_phone?: string;
      role?: string;
    },
  ): Promise<AgendaAttendee> {
    const { data, error } = await supabase
      .from('agenda_attendees')
      .insert({ agenda_id: agendaId, ...attendee })
      .select()
      .single();

    if (error) throw error;
    return data as AgendaAttendee;
  },

  async removeAttendee(attendeeId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_attendees')
      .delete()
      .eq('id', attendeeId);

    if (error) throw error;
  },
};
