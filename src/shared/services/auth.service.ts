import { supabase } from './supabase';
import type { Profile, Permission } from '@/shared/types/auth.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async register({ email, password, full_name, phone }: RegisterData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Buscar role do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) return [];

    // Buscar permissões do role
    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          id,
          resource,
          action,
          description
        )
      `)
      .eq('role_id', (
        await supabase
          .from('roles')
          .select('id')
          .eq('name', profile.role)
          .single()
      ).data?.id);

    // Buscar permissões diretas do usuário
    const { data: userPerms } = await supabase
      .from('user_permissions')
      .select(`
        granted,
        permissions (
          id,
          resource,
          action,
          description
        )
      `)
      .eq('user_id', userId);

    // Merge: role permissions + user overrides
    const permMap = new Map<string, Permission>();

    // Adicionar permissões do role
    if (rolePerms) {
      for (const rp of rolePerms) {
        const perm = (rp as Record<string, unknown>).permissions as Permission;
        if (perm) {
          permMap.set(perm.id, perm);
        }
      }
    }

    // Aplicar overrides do usuário
    if (userPerms) {
      for (const up of userPerms) {
        const perm = (up as Record<string, unknown>).permissions as Permission;
        if (perm) {
          if (up.granted) {
            permMap.set(perm.id, perm);
          } else {
            permMap.delete(perm.id);
          }
        }
      }
    }

    return Array.from(permMap.values());
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
};
