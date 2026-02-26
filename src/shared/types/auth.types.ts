import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  nome_completo: string;
  telefone: string | null;
  avatar_url: string | null;
  papel: string;
  situacao: 'pending' | 'active' | 'disabled';
  aprovado_por: string | null;
  aprovado_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Permission {
  id: string;
  recurso: string;
  acao: string;
  descricao: string | null;
}

export interface UserPermission {
  usuario_id: string;
  permissao_id: string;
  concedida: boolean;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type PermissionCheck = (resource: string, action: string) => boolean;
