import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';

const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const ClientsPage = lazy(() =>
  import('./pages/clients/ClientsPage').then((m) => ({ default: m.ClientsPage })),
);
const ClientDetailPage = lazy(() =>
  import('./pages/clients/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
);
const LocationDetailPage = lazy(() =>
  import('./pages/clients/LocationDetailPage').then((m) => ({ default: m.LocationDetailPage })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LoginPage />} />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CUSTOMER']} />}>
                <Route element={<Layout />}>
                  <Route
                    path="/clients"
                    element={<ProtectedRoute allowedRoles={['ADMIN']} />}
                  >
                    <Route index element={<ClientsPage />} />
                    <Route path=":id" element={<ClientDetailPage />} />
                    <Route path=":clientId/locations/:locationId" element={<LocationDetailPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
