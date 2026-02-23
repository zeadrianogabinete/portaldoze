import { useCallback } from 'react';
import { useAuth } from './useAuth';
import type { PermissionCheck } from '@/shared/types/auth.types';

export function usePermission() {
  const { permissions } = useAuth();

  const can: PermissionCheck = useCallback(
    (resource: string, action: string) => {
      return permissions.some(
        (p) => p.resource === resource && p.action === action,
      );
    },
    [permissions],
  );

  const canAny = useCallback(
    (checks: Array<{ resource: string; action: string }>) => {
      return checks.some(({ resource, action }) => can(resource, action));
    },
    [can],
  );

  const canAll = useCallback(
    (checks: Array<{ resource: string; action: string }>) => {
      return checks.every(({ resource, action }) => can(resource, action));
    },
    [can],
  );

  return { can, canAny, canAll };
}
