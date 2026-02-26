import { supabase } from './supabase';
import type { Profile, Permission } from '@/shared/types/auth.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nome_completo: string;
  telefone?: string;
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

  async register({ email, password, nome_completo, telefone }: RegisterData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nome_completo, phone: telefone },
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
      .from('confi_perfis')
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
      .from('confi_perfis')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Buscar papel do usuário
    const { data: profile } = await supabase
      .from('confi_perfis')
      .select('papel')
      .eq('id', userId)
      .single();

    if (!profile) return [];

    // Buscar permissões do papel
    const { data: rolePerms } = await supabase
      .from('confi_papel_permissoes')
      .select(`
        confi_permissoes (
          id,
          recurso,
          acao,
          descricao
        )
      `)
      .eq('papel_id', (
        await supabase
          .from('confi_papeis')
          .select('id')
          .eq('nome', profile.papel)
          .single()
      ).data?.id);

    // Buscar permissões diretas do usuário
    const { data: userPerms } = await supabase
      .from('confi_usuario_permissoes')
      .select(`
        concedida,
        confi_permissoes (
          id,
          recurso,
          acao,
          descricao
        )
      `)
      .eq('usuario_id', userId);

    // Merge: permissões do papel + overrides do usuário
    const permMap = new Map<string, Permission>();

    if (rolePerms) {
      for (const rp of rolePerms) {
        const perm = (rp as Record<string, unknown>).confi_permissoes as Permission;
        if (perm) {
          permMap.set(perm.id, perm);
        }
      }
    }

    if (userPerms) {
      for (const up of userPerms) {
        const perm = (up as Record<string, unknown>).confi_permissoes as Permission;
        if (perm) {
          if (up.concedida) {
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
