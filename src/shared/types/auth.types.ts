import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: 'pending' | 'active' | 'disabled';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface UserPermission {
  user_id: string;
  permission_id: string;
  granted: boolean;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type PermissionCheck = (resource: string, action: string) => boolean;
