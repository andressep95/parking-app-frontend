import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createTariff } from '../../api/tariffs';
import { listLocations } from '../../api/locations';
import type { CreateTariffRequest, VehicleType } from '../../types/index';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'CAR', label: 'Automóvil' },
  { value: 'MOTORCYCLE', label: 'Motocicleta' },
  { value: 'PICKUP', label: 'Camioneta / SUV' },
  { value: 'BUS', label: 'Bus / Van' },
];

interface Props {
  preselectedLocationId?: string;
  onClose: () => void;
}

export function TariffFormModal({ preselectedLocationId, onClose }: Props) {
  const qc = useQueryClient();

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => listLocations(),
    staleTime: 60_000,
  });

  const [form, setForm] = useState({
    locationId: preselectedLocationId ?? '',
    vehicleType: 'CAR' as VehicleType,
    name: '',
    pricePerHour: '',
    minimumCharge: '0',
    graceMinutes: '0',
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateTariffRequest = {
        locationId: form.locationId,
        vehicleType: form.vehicleType,
        name: form.name,
        pricePerHour: parseFloat(form.pricePerHour),
        minimumCharge: parseFloat(form.minimumCharge) || 0,
        graceMinutes: parseInt(form.graceMinutes, 10) || 0,
      };
      return createTariff(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tariffs'] });
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
    <FormModal title="Crear tarifa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Las tarifas son inmutables. Para cambiar el precio, crea una nueva tarifa — el sistema desactivará automáticamente la anterior del mismo tipo de vehículo.
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Locación <span className="text-red-500">*</span>
          </label>
          <select
            value={form.locationId}
            onChange={(e) => set('locationId', e.target.value)}
            required
            disabled={preselectedLocationId !== undefined}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50"
          >
            <option value="">— Seleccionar locación —</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.locationName} — {l.city}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipo de vehículo <span className="text-red-500">*</span>
            </label>
            <select
              value={form.vehicleType}
              onChange={(e) => set('vehicleType', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Tarifa Día"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Precio/hora (CLP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.pricePerHour}
              onChange={(e) => set('pricePerHour', e.target.value)}
              required
              min={0}
              step={1}
              placeholder="1500"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mínimo (CLP)
            </label>
            <input
              type="number"
              value={form.minimumCharge}
              onChange={(e) => set('minimumCharge', e.target.value)}
              min={0}
              step={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gracia (min)
            </label>
            <input
              type="number"
              value={form.graceMinutes}
              onChange={(e) => set('graceMinutes', e.target.value)}
              min={0}
              max={60}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {mutation.isError ? <ErrorMessage error={mutation.error} /> : null}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creando...' : 'Crear tarifa'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
