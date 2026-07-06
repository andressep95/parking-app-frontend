import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signOut } from 'aws-amplify/auth';
// signOut is used inside attemptSignIn to clear stale sessions before retry
import { useAuthContext } from '../../auth/AuthProvider';

async function attemptSignIn(username: string, password: string) {
  try {
    return await signIn({ username, password });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    // Amplify blocks signIn if there's a stale cached session — clear it and retry once
    if (msg.includes('already a signed in user') || msg.includes('UserAlreadyAuthenticatedException')) {
      await signOut();
      return await signIn({ username, password });
    }
    throw err;
  }
}

export function LoginPage() {
  const { isAuthenticated, isLoading: authLoading, refetch } = useAuthContext();
  const navigate = useNavigate();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, go straight to clients
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/clients', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { isSignedIn } = await attemptSignIn(rut.trim(), password);
      if (isSignedIn) {
        // refetch sets isLoading=true → ProtectedRoute shows spinner, not a redirect.
        // The useEffect above fires navigation once isAuthenticated is true.
        await refetch();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar';
      setError(
        msg.includes('Incorrect') || msg.includes('incorrect') || msg.includes('NotAuthorizedException')
          ? 'RUT o contraseña incorrectos'
          : msg,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Parking App</h1>
          <p className="mt-1 text-sm text-gray-500">Ingresa con tu RUT y contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">RUT</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12345678-9"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {error !== '' ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
