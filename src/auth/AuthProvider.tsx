import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import type { AuthUser, UserRole } from '../types/index';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await fetchAuthSession();

    // Access token: has cognito:groups for RBAC
    const accessPayload = session.tokens?.accessToken?.payload;
    if (!accessPayload) return null;

    // ID token: has email, given_name, family_name (not in access token by default)
    const idPayload = session.tokens?.idToken?.payload;

    const groups = (accessPayload['cognito:groups'] as string[] | undefined) ?? [];
    const webGroups: UserRole[] = ['ADMIN', 'CUSTOMER', 'OPERATOR'];
    const role =
      (groups.find((g) => webGroups.includes(g as UserRole)) as UserRole) ?? null;

    return {
      sub: accessPayload['sub'] as string,
      username: accessPayload['username'] as string,
      email: idPayload?.['email'] as string | undefined,
      givenName: idPayload?.['given_name'] as string | undefined,
      familyName: idPayload?.['family_name'] as string | undefined,
      groups,
      role,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const resolved = await resolveAuthUser();
      setUser(resolved);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveAuthUser()
      .then(setUser)
      .finally(() => setIsLoading(false));

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        resolveAuthUser().then(setUser);
      }
      if (payload.event === 'signedOut' || payload.event === 'tokenRefresh_failure') {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    await amplifySignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        signOut,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
