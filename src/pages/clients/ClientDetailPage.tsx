import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/Badge';
import { Breadcrumb } from '../../components/Breadcrumb';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ClientFormModal } from './ClientFormModal';
import { LocationFormModal } from '../locations/LocationFormModal';
import { TerminalFormModal } from '../terminals/TerminalFormModal';
import { getOrganization } from '../../api/organizations';
import {
  listLocations,
  deleteLocation,
  activateLocation,
  deactivateLocation,
} from '../../api/locations';
import {
  listTerminals,
  deleteTerminal,
  setTerminalMaintenance,
  setTerminalOffline,
} from '../../api/terminals';
import type { Location, Terminal } from '../../types/index';

type LocationModal =
  | { type: 'create' }
  | { type: 'edit'; location: Location }
  | { type: 'delete'; location: Location };

type TerminalModal =
  | { type: 'create' }
  | { type: 'edit'; terminal: Terminal }
  | { type: 'delete'; terminal: Terminal };

function TabCheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab] = useState<'locations' | 'terminals' | 'info'>('locations');
  const [editClient, setEditClient] = useState(false);
  const [locModal, setLocModal] = useState<LocationModal | null>(null);
  const [terminalModal, setTerminalModal] = useState<TerminalModal | null>(null);

  const { data: client, isLoading: loadingClient, error: clientError } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => getOrganization(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ['locations', id],
    queryFn: () => listLocations(id),
    enabled: !!id && tab === 'locations',
    staleTime: 30_000,
  });

  const { data: terminals, isLoading: loadingTerminals } = useQuery({
    queryKey: ['terminals', id],
    queryFn: () => listTerminals({ orgId: id }),
    enabled: !!id && tab === 'terminals',
    staleTime: 30_000,
  });

  const terminalStatusMutation = useMutation({
    mutationFn: ({ tId, action }: { tId: string; action: 'maintenance' | 'offline' }) =>
      action === 'maintenance' ? setTerminalMaintenance(tId) : setTerminalOffline(tId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terminals', id] }),
  });

  const deleteTerminalMutation = useMutation({
    mutationFn: (tId: string) => deleteTerminal(tId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terminals', id] });
      setTerminalModal(null);
    },
  });

  const toggleLocMutation = useMutation({
    mutationFn: ({ locId, active }: { locId: string; active: boolean }) =>
      active ? deactivateLocation(locId) : activateLocation(locId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations', id] }),
  });

  const deleteLocMutation = useMutation({
    mutationFn: (locId: string) => deleteLocation(locId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', id] });
      setLocModal(null);
    },
  });

  if (clientError) {
    return (
      <div className="mt-6">
        <ErrorMessage error={clientError} onRetry={() => qc.invalidateQueries({ queryKey: ['organizations', id] })} />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Clientes', to: '/clients' },
          { label: client?.orgName ?? 'Cliente' },
        ]}
      />

      {/* Header */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
        {loadingClient ? (
          <div className="space-y-2">
            <div className="h-7 w-64 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
        ) : client ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{client.orgName}</h1>
                <Badge status={client.orgStatus} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {client.rutCompany} · {client.orgEmail}
                {client.phoneNumber ? ` · ${client.phoneNumber}` : ''}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="mb-4 inline-flex rounded-md border border-gray-200 bg-white p-1">
        {([['locations', 'Instalaciones'], ['terminals', 'Terminales'], ['info', 'Información']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-brand-600 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === key ? <TabCheckIcon /> : null}
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Instalaciones */}
      {tab === 'locations' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setLocModal({ type: 'create' })}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Nueva instalación
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {loadingLocations ? (
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-4">
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : !locations?.length ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400">Este cliente no tiene instalaciones registradas</p>
                <button
                  onClick={() => setLocModal({ type: 'create' })}
                  className="mt-2 text-sm text-gray-900 underline underline-offset-2"
                >
                  Agregar la primera
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Instalación</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Dirección</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ciudad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Capacidad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/clients/${id}/locations/${loc.id}`)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{loc.locationName}</p>
                        <p className="text-xs text-gray-400">{loc.timezone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{loc.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{loc.city}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{loc.capacity} espacios</td>
                      <td className="px-4 py-3">
                        <Badge status={loc.locationStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setLocModal({ type: 'edit', location: loc })}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              toggleLocMutation.mutate({ locId: loc.id, active: loc.locationStatus === 'ACTIVE' })
                            }
                            className="text-xs text-gray-500 hover:underline"
                          >
                            {loc.locationStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => setLocModal({ type: 'delete', location: loc })}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab: Terminales */}
      {tab === 'terminals' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setTerminalModal({ type: 'create' })}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Nuevo terminal
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Terminal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Versión app</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Último heartbeat</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTerminals ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 animate-pulse rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !terminals?.length ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      Este cliente no tiene terminales registrados
                    </td>
                  </tr>
                ) : (
                  terminals.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{t.serialNumber}</p>
                        <p className="text-xs text-gray-400">{t.model}</p>
                      </td>
                      <td className="px-4 py-3"><Badge status={t.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{t.appVersion ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {t.lastHeartbeat
                          ? new Date(t.lastHeartbeat).toLocaleString('es-CL', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          {t.status !== 'MAINTENANCE' ? (
                            <button
                              onClick={() => terminalStatusMutation.mutate({ tId: t.id, action: 'maintenance' })}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Mantenimiento
                            </button>
                          ) : (
                            <button
                              onClick={() => terminalStatusMutation.mutate({ tId: t.id, action: 'offline' })}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Poner offline
                            </button>
                          )}
                          <button
                            onClick={() => setTerminalModal({ type: 'delete', terminal: t })}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Eliminar
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

      {/* Tab: Info */}
      {tab === 'info' && client ? (
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {[
            { label: 'Razón social', value: client.orgName },
            { label: 'RUT empresa', value: client.rutCompany },
            { label: 'Email', value: client.orgEmail },
            { label: 'Teléfono', value: client.phoneNumber ?? '—' },
            { label: 'Estado', value: <Badge status={client.orgStatus} /> },
            {
              label: 'Creado el',
              value: new Date(client.createdAt).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center px-4 py-3">
              <span className="w-40 text-sm text-gray-500 shrink-0">{label}</span>
              <span className="text-sm text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* Modals */}
      {editClient && client ? (
        <ClientFormModal org={client} onClose={() => setEditClient(false)} />
      ) : null}

      {locModal?.type === 'create' ? (
        <LocationFormModal orgId={id} onClose={() => setLocModal(null)} />
      ) : null}

      {locModal?.type === 'edit' ? (
        <LocationFormModal location={locModal.location} onClose={() => setLocModal(null)} />
      ) : null}

      {locModal?.type === 'delete' ? (
        <ConfirmModal
          title="Eliminar instalación"
          message={`¿Eliminar "${locModal.location.locationName}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteLocMutation.isPending}
          onConfirm={() => deleteLocMutation.mutate(locModal.location.id)}
          onCancel={() => setLocModal(null)}
        />
      ) : null}

      {terminalModal?.type === 'create' ? (
        <TerminalFormModal prefillOrgId={id} onClose={() => setTerminalModal(null)} />
      ) : null}

      {terminalModal?.type === 'edit' ? (
        <TerminalFormModal terminal={terminalModal.terminal} onClose={() => setTerminalModal(null)} />
      ) : null}

      {terminalModal?.type === 'delete' ? (
        <ConfirmModal
          title="Eliminar terminal"
          message={`¿Eliminar el terminal "${terminalModal.terminal.serialNumber}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteTerminalMutation.isPending}
          onConfirm={() => deleteTerminalMutation.mutate(terminalModal.terminal.id)}
          onCancel={() => setTerminalModal(null)}
        />
      ) : null}
    </div>
  );
}
