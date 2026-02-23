import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/services/supabase';
import { authService } from '@/shared/services/auth.service';
import type { Profile, Permission, AuthState } from '@/shared/types/auth.types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const [profileData, permsData] = await Promise.all([
        authService.getProfile(userId),
        authService.getUserPermissions(userId),
      ]);
      setProfile(profileData);
      setPermissions(permsData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    // Carregar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Escutar mudanças de auth
    // NÃO usar await aqui — causa deadlock com o lock manager do supabase-js
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setPermissions([]);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { session } = await authService.login({ email, password });
    // Carregar perfil antes de liberar — evita race condition com o auth guard
    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user.id);
    }
    setIsLoading(false);
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
    setPermissions([]);
  }, []);

  return {
    user,
    profile,
    permissions,
    isLoading,
    isAuthenticated: !!user && !!profile,
    login,
    logout,
    refreshProfile,
  };
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
