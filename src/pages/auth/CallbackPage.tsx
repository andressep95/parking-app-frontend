import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession } from 'aws-amplify/auth';

export function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  // Prevent double-navigation (StrictMode mounts effects twice)
  const didNavigate = useRef(false);

  useEffect(() => {
    function goToDashboard() {
      if (didNavigate.current) return;
      didNavigate.current = true;
      navigate('/dashboard', { replace: true });
    }

    // Listen for Amplify's OAuth completion event
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        goToDashboard();
      }
      if (payload.event === 'signInWithRedirect_failure') {
        setError('Error al autenticar. Por favor intenta de nuevo.');
      }
    });

    // Also check immediately — handles the case where Amplify
    // finished the token exchange before this effect mounted
    fetchAuthSession()
      .then((session) => {
        if (session.tokens) goToDashboard();
      })
      .catch(() => {
        // Exchange still in progress; Hub event will handle it
      });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error !== null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="text-sm text-brand-600 underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      <p className="text-sm text-gray-500">Autenticando...</p>
    </div>
  );
}
