export interface Agenda {
  id: string;
  title: string;
  description: string | null;
  agenda_topic: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  recurrence_rule: RecurrenceRule | null;
  recurrence_parent_id: string | null;
  recurrence_exception: boolean;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  status: 'proposed' | 'approved' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  politician_presence: 'politician' | 'representative' | 'none';
  representative_name: string | null;
  advisory_notes: string | null;
  created_by: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgendaAttendee {
  id: string;
  agenda_id: string;
  user_id: string | null;
  contact_id: string | null;
  external_name: string | null;
  external_phone: string | null;
  role: 'admin' | 'member' | 'observer';
  rsvp: 'pending' | 'accepted' | 'declined' | 'tentative';
  created_at: string;
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
  title: string;
  description?: string;
  agenda_topic?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  recurrence_rule?: RecurrenceRule;
  location_name?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  location_place_id?: string;
  status?: 'proposed' | 'approved';
  politician_presence?: 'politician' | 'representative' | 'none';
  representative_name?: string;
  advisory_notes?: string;
  color?: string;
}
