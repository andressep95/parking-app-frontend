import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { TariffFormModal } from './TariffFormModal';
import { listTariffs, deactivateTariff } from '../../api/tariffs';
import { listLocations } from '../../api/locations';
import type { Column } from '../../components/DataTable';
import type { Tariff } from '../../types/index';

const VEHICLE_LABELS: Record<string, string> = {
  CAR: 'Automóvil',
  MOTORCYCLE: 'Motocicleta',
  PICKUP: 'Camioneta / SUV',
  BUS: 'Bus / Van',
};

interface ActiveModal {
  type: 'create' | 'deactivate';
  tariff?: Tariff;
  locationId?: string;
}

export function TariffsPage() {
  const qc = useQueryClient();
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
    staleTime: 60_000,
  });

  const { data: tariffs, isLoading, error, refetch } = useQuery({
    queryKey: ['tariffs', locationFilter, showInactive],
    queryFn: () =>
      listTariffs({
        locationId: locationFilter || undefined,
        active: showInactive ? undefined : true,
      }),
    staleTime: 30_000,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateTariff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tariffs'] });
      setActiveModal(null);
    },
  });

  const locationMap = new Map(locations?.map((l) => [l.id, l.locationName]) ?? []);

  const columns: Column<Tariff>[] = [
    {
      key: 'location',
      header: 'Locación',
      render: (t) => (
        <span className="text-gray-700">{locationMap.get(t.locationId) ?? t.locationId}</span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Tipo vehículo',
      render: (t) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {VEHICLE_LABELS[t.vehicleType] ?? t.vehicleType}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (t) => <span className="text-gray-800">{t.name}</span>,
    },
    {
      key: 'price',
      header: 'Precio/hora',
      render: (t) => (
        <span className="font-medium text-gray-900">
          ${t.pricePerHour.toLocaleString('es-CL')}
        </span>
      ),
    },
    {
      key: 'minimum',
      header: 'Mínimo',
      render: (t) => (
        <span className="text-gray-600">${t.minimumCharge.toLocaleString('es-CL')}</span>
      ),
    },
    {
      key: 'grace',
      header: 'Gracia',
      render: (t) => <span className="text-gray-600">{t.graceMinutes} min</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (t) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {t.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (t) =>
        t.isActive ? (
          <button
            onClick={() => setActiveModal({ type: 'deactivate', tariff: t })}
            className="text-xs text-red-600 hover:underline"
          >
            Desactivar
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tarifas"
        description="Precios por tipo de vehículo y locación"
        action={
          <button
            onClick={() => setActiveModal({ type: 'create', locationId: locationFilter || undefined })}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Crear tarifa
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-4">
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Todas las locaciones</option>
          {locations?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.locationName}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 text-brand-600"
          />
          Mostrar tarifas inactivas
        </label>
      </div>

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      <DataTable
        columns={columns}
        data={tariffs ?? []}
        keyFn={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No hay tarifas configuradas"
      />

      {activeModal?.type === 'create' ? (
        <TariffFormModal
          preselectedLocationId={activeModal.locationId}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal?.type === 'deactivate' && activeModal.tariff ? (
        <ConfirmModal
          title="Desactivar tarifa"
          message={`¿Desactivar la tarifa "${activeModal.tariff.name}" para ${VEHICLE_LABELS[activeModal.tariff.vehicleType]}? El historial de precios se conserva.`}
          confirmLabel="Desactivar"
          danger
          isLoading={deactivateMutation.isPending}
          onConfirm={() => deactivateMutation.mutate(activeModal.tariff!.id)}
          onCancel={() => setActiveModal(null)}
        />
      ) : null}
    </div>
  );
}
