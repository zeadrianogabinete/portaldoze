import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/shared/services/supabase';
import { PageContainer } from '@/shared/components/layout/PageContainer';
import { cn } from '@/shared/utils/cn';

interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

export const Route = createFileRoute('/_authenticated/settings/permissions')({
  component: Permissoes,
});

function Permissoes() {
  const { data: roles } = useQuery({
    queryKey: ['settings', 'roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('name');
      if (error) throw error;
      return data as Role[];
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ['settings', 'permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('permissions').select('*').order('resource, action');
      if (error) throw error;
      return data as Permission[];
    },
  });

  const { data: rolePermissions } = useQuery({
    queryKey: ['settings', 'role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('role_permissions').select('*');
      if (error) throw error;
      return data as RolePermission[];
    },
  });

  const hasPermission = (roleId: string, permissionId: string) =>
    rolePermissions?.some((rp) => rp.role_id === roleId && rp.permission_id === permissionId) ?? false;

  return (
    <PageContainer
      title="Permissões"
      subtitle="Matriz de permissões por perfil"
      actions={
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </Link>
      }
    >
      <div className="overflow-x-auto rounded-xl border border-[var(--color-neutral-200)] bg-white shadow-[var(--shadow-card)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
              <th className="sticky left-0 bg-[var(--color-neutral-50)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
                Permissão
              </th>
              {roles?.map((role) => (
                <th
                  key={role.id}
                  className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]"
                >
                  {role.display_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-neutral-100)]">
            {permissions?.map((perm) => (
              <tr key={perm.id}>
                <td className="sticky left-0 bg-white px-4 py-3">
                  <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                    {perm.resource}.{perm.action}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">{perm.description}</p>
                </td>
                {roles?.map((role) => (
                  <td key={role.id} className="px-3 py-3 text-center">
                    <div
                      className={cn(
                        'mx-auto h-5 w-5 rounded-full',
                        hasPermission(role.id, perm.id)
                          ? 'bg-green-500'
                          : 'bg-[var(--color-neutral-200)]',
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
