import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LocationFormModal } from './LocationFormModal';
import {
  listLocations,
  deleteLocation,
  activateLocation,
  deactivateLocation,
} from '../../api/locations';
import { usePermissions } from '../../hooks/usePermissions';
import type { Column } from '../../components/DataTable';
import type { Location } from '../../types/index';

type ModalType = 'create' | 'edit' | 'delete';

interface ActiveModal {
  type: ModalType;
  location?: Location;
}

export function LocationsPage() {
  const qc = useQueryClient();
  const { canCreateLocations, canDeleteLocations } = usePermissions();
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  const { data: locations, isLoading, error, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
    staleTime: 30_000,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateLocation(id) : activateLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      setActiveModal(null);
    },
  });

  const columns: Column<Location>[] = [
    {
      key: 'name',
      header: 'Locación',
      render: (l) => (
        <div>
          <p className="font-medium text-gray-900">{l.locationName}</p>
          <p className="text-xs text-gray-400">{l.city}</p>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Dirección',
      render: (l) => <span className="text-gray-600">{l.address}</span>,
    },
    {
      key: 'capacity',
      header: 'Capacidad',
      render: (l) => (
        <span className="font-medium text-gray-700">{l.capacity} espacios</span>
      ),
    },
    {
      key: 'timezone',
      header: 'Zona horaria',
      render: (l) => <span className="text-xs text-gray-500">{l.timezone}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (l) => <Badge status={l.locationStatus} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (l) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal({ type: 'edit', location: l })}
            className="text-xs text-brand-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() =>
              toggleStatusMutation.mutate({ id: l.id, active: l.locationStatus === 'ACTIVE' })
            }
            className="text-xs text-gray-500 hover:underline"
          >
            {l.locationStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
          </button>
          {canDeleteLocations ? (
            <button
              onClick={() => setActiveModal({ type: 'delete', location: l })}
              className="text-xs text-red-600 hover:underline"
            >
              Eliminar
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locaciones"
        description="Puntos físicos de estacionamiento"
        action={
          canCreateLocations ? (
            <button
              onClick={() => setActiveModal({ type: 'create' })}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Crear locación
            </button>
          ) : undefined
        }
      />

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      <DataTable
        columns={columns}
        data={locations ?? []}
        keyFn={(l) => l.id}
        isLoading={isLoading}
        emptyMessage="No hay locaciones registradas"
      />

      {activeModal?.type === 'create' ? (
        <LocationFormModal onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'edit' && activeModal.location ? (
        <LocationFormModal location={activeModal.location} onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'delete' && activeModal.location ? (
        <ConfirmModal
          title="Eliminar locación"
          message={`¿Eliminar "${activeModal.location.locationName}"? La operación falla si hay terminales o sesiones activas.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(activeModal.location!.id)}
          onCancel={() => setActiveModal(null)}
        />
      ) : null}
    </div>
  );
}
