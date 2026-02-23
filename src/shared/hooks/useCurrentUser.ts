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
    isActive: profile?.status === 'active',
    isPending: profile?.status === 'pending',
    isDisabled: profile?.status === 'disabled',
    isAdmin: profile?.role === 'admin',
    can,
    canAny,
    canAll,
  };
}
