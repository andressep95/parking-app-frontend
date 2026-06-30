import { useQueries } from '@tanstack/react-query';
import { useAuthContext } from '../../auth/AuthProvider';
import { usePermissions } from '../../hooks/usePermissions';
import { listUsers } from '../../api/users';
import { listOrganizations } from '../../api/organizations';
import { listLocations } from '../../api/locations';
import { listTerminals } from '../../api/terminals';

interface StatCardProps {
  label: string;
  value: number | string;
  description: string;
  color: string;
}

function StatCard({ label, value, description, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuthContext();
  const { isAdmin } = usePermissions();

  const results = useQueries({
    queries: [
      {
        queryKey: ['users-count'],
        queryFn: () => listUsers(),
        staleTime: 30_000,
      },
      {
        queryKey: ['orgs-count'],
        queryFn: () => listOrganizations(),
        staleTime: 30_000,
        enabled: isAdmin,
      },
      {
        queryKey: ['locations-count'],
        queryFn: () => listLocations(),
        staleTime: 30_000,
      },
      {
        queryKey: ['terminals-count'],
        queryFn: () => listTerminals(),
        staleTime: 30_000,
      },
    ],
  });

  const [usersResult, orgsResult, locationsResult, terminalsResult] = results;

  const totalUsers = usersResult.data?.length ?? 0;
  const totalOrgs = orgsResult.data?.length ?? 0;
  const totalLocations = locationsResult.data?.length ?? 0;
  const totalTerminals = terminalsResult.data?.length ?? 0;
  const onlineTerminals = terminalsResult.data?.filter((t) => t.status === 'ONLINE').length ?? 0;

  const firstName = user?.givenName ?? user?.username ?? 'Usuario';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {firstName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen del sistema — {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Usuarios"
          value={usersResult.isLoading ? '...' : totalUsers}
          description="Registrados en el sistema"
          color="text-brand-600"
        />
        {isAdmin ? (
          <StatCard
            label="Organizaciones"
            value={orgsResult.isLoading ? '...' : totalOrgs}
            description="Empresas cliente activas"
            color="text-purple-600"
          />
        ) : null}
        <StatCard
          label="Locaciones"
          value={locationsResult.isLoading ? '...' : totalLocations}
          description="Puntos de estacionamiento"
          color="text-green-600"
        />
        <StatCard
          label="Terminales"
          value={terminalsResult.isLoading ? '...' : `${onlineTerminals}/${totalTerminals}`}
          description="En línea / Total"
          color="text-orange-600"
        />
      </div>

      {terminalsResult.data && terminalsResult.data.length > 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Estado de Terminales</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {terminalsResult.data.map((terminal) => (
              <div
                key={terminal.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{terminal.serialNumber}</p>
                  <p className="text-xs text-gray-400">{terminal.model}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    terminal.status === 'ONLINE'
                      ? 'bg-green-100 text-green-800'
                      : terminal.status === 'MAINTENANCE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {terminal.status === 'ONLINE' ? 'En línea' : terminal.status === 'MAINTENANCE' ? 'Mantenimiento' : 'Desconectado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
