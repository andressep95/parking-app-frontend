import { useAuthContext } from '../auth/AuthProvider';

export function usePermissions() {
  const { user } = useAuthContext();
  const role = user?.role ?? null;

  return {
    isAdmin: role === 'ADMIN',
    isCustomer: role === 'CUSTOMER',
    canManageOrgs: role === 'ADMIN',
    canDeleteUsers: role === 'ADMIN',
    canResetPasswords: role === 'ADMIN',
    canForceLogout: role === 'ADMIN',
    canCreateLocations: role === 'ADMIN',
    canDeleteLocations: role === 'ADMIN',
    canManageTerminals: role === 'ADMIN',
    orgId: user?.sub ?? null,
  };
}
