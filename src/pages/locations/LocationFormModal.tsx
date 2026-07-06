import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createLocation, updateLocation } from '../../api/locations';
import { listOrganizations } from '../../api/organizations';
import { usePermissions } from '../../hooks/usePermissions';
import type { Location, CreateLocationRequest, UpdateLocationRequest } from '../../types/index';

const TIMEZONES = [
  'America/Santiago',
  'America/Lima',
  'America/Bogota',
  'America/Buenos_Aires',
  'America/Montevideo',
];

interface Props {
  location?: Location;
  orgId?: string;
  onClose: () => void;
}

export function LocationFormModal({ location, orgId: prefillOrgId, onClose }: Props) {
  const isEdit = location !== undefined;
  const qc = useQueryClient();
  const { isAdmin } = usePermissions();

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const [form, setForm] = useState({
    orgId: location?.orgId ?? prefillOrgId ?? '',
    locationName: location?.locationName ?? '',
    address: location?.address ?? '',
    city: location?.city ?? '',
    timezone: location?.timezone ?? 'America/Santiago',
    capacity: String(location?.capacity ?? ''),
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateLocationRequest = {
          locationName: form.locationName || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          timezone: form.timezone || undefined,
          capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        };
        return updateLocation(location.id, payload);
      }
      const payload: CreateLocationRequest = {
        orgId: form.orgId,
        locationName: form.locationName,
        address: form.address,
        city: form.city,
        timezone: form.timezone,
        capacity: parseInt(form.capacity, 10),
      };
      return createLocation(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <FormModal title={isEdit ? 'Editar locación' : 'Crear locación'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && !isEdit ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Organización <span className="text-red-500">*</span>
            </label>
            <select
              value={form.orgId}
              onChange={(e) => set('orgId', e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Seleccionar organización —</option>
              {orgs?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orgName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.locationName}
            onChange={(e) => set('locationName', e.target.value)}
            required
            placeholder="Sucursal Centro"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            required
            placeholder="Av. Bernardo O'Higgins 1234"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              required
              placeholder="Santiago"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Capacidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
              required
              min={1}
              placeholder="150"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Zona horaria</label>
          <select
            value={form.timezone}
            onChange={(e) => set('timezone', e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {mutation.isError ? <ErrorMessage error={mutation.error} /> : null}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear locación'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
