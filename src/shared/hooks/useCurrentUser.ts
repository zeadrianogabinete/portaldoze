import { useAuth } from './useAuth';
import { usePermission } from './usePermission';

export function useCurrentUser() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const { can, canAny, canAll } = usePermission();

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isActive: profile?.situacao === 'active',
    isPending: profile?.situacao === 'pending',
    isDisabled: profile?.situacao === 'disabled',
    isAdmin: profile?.papel === 'admin',
    can,
    canAny,
    canAll,
  };
}
