import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { FormModal } from '../../components/FormModal';
import { LocationFormModal } from '../locations/LocationFormModal';
import { TariffFormModal } from '../tariffs/TariffFormModal';
import { getOrganization } from '../../api/organizations';
import { getLocation } from '../../api/locations';
import { listUsers, createUser, activateUser, deactivateUser } from '../../api/users';
import { listTariffs, deactivateTariff } from '../../api/tariffs';
import type { Tariff, User, CreateUserRequest } from '../../types/index';

type Tab = 'operators' | 'tariffs';

type TariffModal = { type: 'create' } | { type: 'deactivate'; tariff: Tariff };

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const computed = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return computed === dv;
}

function OperatorFormModal({
  orgId,
  locationId,
  onClose,
}: {
  orgId: string;
  locationId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    rut: '',
    password: '',
    givenName: '',
    familyName: '',
    email: '',
    phoneNumber: '',
  });
  const [rutError, setRutError] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateUserRequest = {
        rut: form.rut,
        password: form.password,
        givenName: form.givenName,
        familyName: form.familyName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        role: 'OPERATOR',
        orgId,
        locationId,
      };
      return createUser(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRut(form.rut)) {
      setRutError('RUT inválido');
      return;
    }
    setRutError('');
    mutation.mutate();
  };

  const set = (f: string, v: string) => setForm((prev) => ({ ...prev, [f]: v }));

  return (
    <FormModal title="Nuevo operador" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            RUT <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.rut}
            onChange={(e) => set('rut', e.target.value)}
            placeholder="12345678-9"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {rutError ? <p className="mt-1 text-xs text-red-600">{rutError}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="Mínimo 10 caracteres"
            required
            minLength={10}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.givenName}
              onChange={(e) => set('givenName', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.familyName}
              onChange={(e) => set('familyName', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => set('phoneNumber', e.target.value)}
            placeholder="+56912345678"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
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
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creando...' : 'Crear operador'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}

const VEHICLE_LABELS: Record<string, string> = {
  CAR: 'Automóvil',
  MOTORCYCLE: 'Motocicleta',
  PICKUP: 'Camioneta / SUV',
  BUS: 'Bus / Van',
};

const TERMINAL_STATUS_LABELS: Record<string, string> = {
  ONLINE: 'En línea',
  OFFLINE: 'Desconectado',
  MAINTENANCE: 'Mantenimiento',
};

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <tr key={i}>
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 animate-pulse rounded bg-gray-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function LocationDetailPage() {
  const { clientId, locationId } = useParams<{ clientId: string; locationId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>('operators');
  const [editLocation, setEditLocation] = useState(false);
  const [operatorModal, setOperatorModal] = useState(false);
  const [tariffModal, setTariffModal] = useState<TariffModal | null>(null);

  const { data: client } = useQuery({
    queryKey: ['organizations', clientId],
    queryFn: () => getOrganization(clientId!),
    enabled: !!clientId,
    staleTime: 60_000,
  });

  const { data: location, isLoading: loadingLocation, error: locationError } = useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => getLocation(locationId!),
    enabled: !!locationId,
    staleTime: 30_000,
  });

  const { data: allUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', clientId],
    queryFn: () => listUsers(clientId),
    enabled: !!clientId && tab === 'operators',
    staleTime: 30_000,
  });

  const operators: User[] = (allUsers ?? []).filter(
    (u) => u.role === 'OPERATOR' && u.locationId === locationId,
  );

  const { data: tariffs, isLoading: loadingTariffs } = useQuery({
    queryKey: ['tariffs', locationId],
    queryFn: () => listTariffs({ locationId }),
    enabled: !!locationId && tab === 'tariffs',
    staleTime: 30_000,
  });

  const toggleOperatorMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      active ? deactivateUser(userId) : activateUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', clientId] }),
  });

  const deactivateTariffMutation = useMutation({
    mutationFn: (id: string) => deactivateTariff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tariffs', locationId] });
      setTariffModal(null);
    },
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'operators', label: 'Operadores' },
    { key: 'tariffs', label: 'Tarifas' },
  ];

  if (locationError) {
    return (
      <div className="mt-6">
        <ErrorMessage
          error={locationError}
          onRetry={() => qc.invalidateQueries({ queryKey: ['locations', locationId] })}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(`/clients/${clientId}`)}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeftIcon />
        {client?.orgName ?? 'Cliente'}
      </button>

      {/* Header */}
      {loadingLocation ? (
        <div className="mb-6 space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>
      ) : location ? (
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{location.locationName}</h1>
              <Badge status={location.locationStatus} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {location.address}, {location.city} · {location.capacity} espacios · {location.timezone}
            </p>
          </div>
          <button
            onClick={() => setEditLocation(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar instalación
          </button>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Operadores */}
      {tab === 'operators' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setOperatorModal(true)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Nuevo operador
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Operador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teléfono</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingUsers ? (
                  <SkeletonRows cols={5} />
                ) : !operators.length ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      No hay operadores asignados a esta instalación
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {op.givenName} {op.familyName}
                        </p>
                        <p className="text-xs text-gray-400">{op.rut}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{op.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{op.phoneNumber ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge status={op.userStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              toggleOperatorMutation.mutate({
                                userId: op.id,
                                active: op.userStatus === 'ACTIVE',
                              })
                            }
                            className="text-xs text-gray-500 hover:underline"
                          >
                            {op.userStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tarifas */}
      {tab === 'tariffs' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Las tarifas son inmutables. Para modificar, crea una nueva — el sistema desactivará la anterior del mismo tipo.
            </p>
            <button
              onClick={() => setTariffModal({ type: 'create' })}
              className="ml-4 shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Nueva tarifa
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vehículo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Precio/hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Mínimo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Gracia</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Vigente desde</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Activa</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTariffs ? (
                  <SkeletonRows cols={8} />
                ) : !tariffs?.length ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                      No hay tarifas configuradas para esta instalación
                    </td>
                  </tr>
                ) : (
                  tariffs.map((tar) => (
                    <tr key={tar.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tar.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {VEHICLE_LABELS[tar.vehicleType] ?? tar.vehicleType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${tar.pricePerHour.toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        ${tar.minimumCharge.toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tar.graceMinutes} min</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(tar.validFrom).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            tar.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {tar.isActive ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {tar.isActive ? (
                            <button
                              onClick={() => setTariffModal({ type: 'deactivate', tariff: tar })}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Desactivar
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {editLocation && location ? (
        <LocationFormModal location={location} onClose={() => setEditLocation(false)} />
      ) : null}

      {operatorModal ? (
        <OperatorFormModal
          orgId={clientId!}
          locationId={locationId!}
          onClose={() => setOperatorModal(false)}
        />
      ) : null}

      {tariffModal?.type === 'create' ? (
        <TariffFormModal
          preselectedLocationId={locationId}
          onClose={() => setTariffModal(null)}
        />
      ) : null}

      {tariffModal?.type === 'deactivate' ? (
        <ConfirmModal
          title="Desactivar tarifa"
          message={`¿Desactivar la tarifa "${tariffModal.tariff.name}"?`}
          confirmLabel="Desactivar"
          danger
          isLoading={deactivateTariffMutation.isPending}
          onConfirm={() => deactivateTariffMutation.mutate(tariffModal.tariff.id)}
          onCancel={() => setTariffModal(null)}
        />
      ) : null}
    </div>
  );
}
