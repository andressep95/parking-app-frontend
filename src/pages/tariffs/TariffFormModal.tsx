import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createTariff } from '../../api/tariffs';
import { listLocations } from '../../api/locations';
import type { CreateTariffRequest, TariffType, VehicleType } from '../../types/index';

const INPUT =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'CAR', label: 'Automóvil' },
  { value: 'MOTORCYCLE', label: 'Motocicleta' },
  { value: 'PICKUP', label: 'Camioneta / SUV' },
  { value: 'BUS', label: 'Bus / Van' },
];

const TARIFF_TYPE_OPTIONS: { value: TariffType; label: string; description: string }[] = [
  {
    value: 'PER_MINUTE',
    label: 'Por minuto',
    description: 'Cobra por cada minuto con gracia y tope opcionales.',
  },
  {
    value: 'BRACKET',
    label: 'Por tramos',
    description: 'Precio distinto por rango de tiempo acumulado.',
  },
  {
    value: 'FLAT_ENTRY',
    label: 'Ingreso único',
    description: 'Monto fijo al ingresar, sin importar el tiempo.',
  },
];

interface BracketRow {
  fromMinute: string;
  toMinute: string;
  pricePerMinute: string;
}

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
    tariffType: 'PER_MINUTE' as TariffType,
    name: '',
    pricePerMinute: '',
    graceMinutes: '0',
    maxCharge: '',
    flatAmount: '',
  });

  const [brackets, setBrackets] = useState<BracketRow[]>([
    { fromMinute: '0', toMinute: '', pricePerMinute: '' },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: CreateTariffRequest) => createTariff(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tariffs'] });
      onClose();
    },
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addBracket = () => {
    const last = brackets[brackets.length - 1];
    setBrackets((prev) => [
      ...prev,
      { fromMinute: last.toMinute || '', toMinute: '', pricePerMinute: '' },
    ]);
  };

  const updateBracket = (idx: number, field: keyof BracketRow, value: string) => {
    setBrackets((prev) => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const removeBracket = (idx: number) => {
    setBrackets((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.tariffType === 'BRACKET') {
      for (let i = 0; i < brackets.length; i++) {
        const br = brackets[i];
        if (!br.fromMinute || !br.pricePerMinute) {
          setFormError(`Tramo ${i + 1}: los campos Desde y $/minuto son requeridos.`);
          return;
        }
        const isLast = i === brackets.length - 1;
        if (!isLast && !br.toMinute) {
          setFormError(`Tramo ${i + 1}: define el tiempo final antes de agregar más tramos.`);
          return;
        }
        if (br.toMinute && parseInt(br.toMinute, 10) <= parseInt(br.fromMinute, 10)) {
          setFormError(`Tramo ${i + 1}: el tiempo final debe ser mayor al tiempo inicial.`);
          return;
        }
      }
    }

    const payload: CreateTariffRequest = {
      locationId: form.locationId,
      vehicleType: form.vehicleType,
      tariffType: form.tariffType,
      name: form.name,
      ...(form.tariffType === 'PER_MINUTE' && {
        pricePerMinute: parseFloat(form.pricePerMinute),
      }),
      ...(form.tariffType !== 'FLAT_ENTRY' && {
        graceMinutes: parseInt(form.graceMinutes, 10) || 0,
      }),
      ...(form.maxCharge && form.tariffType !== 'FLAT_ENTRY' && {
        maxCharge: parseFloat(form.maxCharge),
      }),
      ...(form.tariffType === 'FLAT_ENTRY' && {
        flatAmount: parseFloat(form.flatAmount),
      }),
      ...(form.tariffType === 'BRACKET' && {
        brackets: brackets.map((br, i) => ({
          position: i + 1,
          fromMinute: parseInt(br.fromMinute, 10),
          toMinute: br.toMinute ? parseInt(br.toMinute, 10) : undefined,
          pricePerMinute: parseFloat(br.pricePerMinute),
        })),
      }),
    };

    mutation.mutate(payload);
  };

  return (
    <FormModal title="Crear tarifa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Immutability notice */}
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          Las tarifas son inmutables. Para cambiar el precio, crea una nueva — el sistema
          desactivará automáticamente la anterior del mismo tipo de vehículo.
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Locación <span className="text-red-500">*</span>
          </label>
          <select
            value={form.locationId}
            onChange={(e) => set('locationId', e.target.value)}
            required
            disabled={preselectedLocationId !== undefined}
            className={INPUT}
          >
            <option value="">— Seleccionar locación —</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.locationName} — {l.city}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle type + Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipo de vehículo <span className="text-red-500">*</span>
            </label>
            <select
              value={form.vehicleType}
              onChange={(e) => set('vehicleType', e.target.value)}
              required
              className={INPUT}
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
              className={INPUT}
            />
          </div>
        </div>

        {/* Tariff type selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tipo de tarifa <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TARIFF_TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('tariffType', t.value)}
                className={`rounded-lg border-2 p-3 text-left transition-colors ${
                  form.tariffType === t.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-800">{t.label}</div>
                <div className="mt-0.5 text-xs text-gray-500">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── PER_MINUTE ────────────────────────── */}
        {form.tariffType === 'PER_MINUTE' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Precio por minuto (CLP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.pricePerMinute}
                onChange={(e) => set('pricePerMinute', e.target.value)}
                required
                min={0}
                step={0.01}
                placeholder="25"
                className={INPUT}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tope máximo (CLP)
                </label>
                <input
                  type="number"
                  value={form.maxCharge}
                  onChange={(e) => set('maxCharge', e.target.value)}
                  min={0}
                  step={1}
                  placeholder="Sin tope"
                  className={INPUT}
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
                  max={120}
                  className={INPUT}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BRACKET ───────────────────────────── */}
        {form.tariffType === 'BRACKET' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tope máximo (CLP)
                </label>
                <input
                  type="number"
                  value={form.maxCharge}
                  onChange={(e) => set('maxCharge', e.target.value)}
                  min={0}
                  step={1}
                  placeholder="Sin tope"
                  className={INPUT}
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
                  max={120}
                  className={INPUT}
                />
              </div>
            </div>

            {/* Bracket editor */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Tramos <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addBracket}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  + Agregar tramo
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                  <span>Desde (min)</span>
                  <span>Hasta (min)</span>
                  <span>$/minuto</span>
                  <span />
                </div>

                {brackets.map((br, i) => {
                  const isLast = i === brackets.length - 1;
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_1fr_1fr_2rem] items-center gap-2 border-t border-gray-100 px-3 py-2"
                    >
                      <input
                        type="number"
                        value={br.fromMinute}
                        onChange={(e) => updateBracket(i, 'fromMinute', e.target.value)}
                        min={0}
                        placeholder="0"
                        required
                        className={INPUT}
                      />
                      <input
                        type="number"
                        value={br.toMinute}
                        onChange={(e) => updateBracket(i, 'toMinute', e.target.value)}
                        min={0}
                        placeholder={isLast ? '∞' : '60'}
                        disabled={isLast}
                        className={INPUT}
                      />
                      <input
                        type="number"
                        value={br.pricePerMinute}
                        onChange={(e) => updateBracket(i, 'pricePerMinute', e.target.value)}
                        min={0}
                        step={0.01}
                        placeholder="20"
                        required
                        className={INPUT}
                      />
                      <button
                        type="button"
                        onClick={() => removeBracket(i)}
                        disabled={brackets.length === 1}
                        className="flex h-7 w-7 items-center justify-center rounded text-lg text-gray-400 hover:text-red-500 disabled:opacity-30"
                        aria-label="Eliminar tramo"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                El último tramo no tiene límite de tiempo (∞).
              </p>
            </div>
          </div>
        )}

        {/* ── FLAT_ENTRY ────────────────────────── */}
        {form.tariffType === 'FLAT_ENTRY' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Monto fijo (CLP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.flatAmount}
              onChange={(e) => set('flatAmount', e.target.value)}
              required
              min={0}
              step={1}
              placeholder="5000"
              className={INPUT}
            />
            <p className="mt-1 text-xs text-gray-400">
              Se cobra al ingreso. El tiempo de estadía no afecta el monto.
            </p>
          </div>
        )}

        {formError ? (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{formError}</p>
        ) : null}

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
