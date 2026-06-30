import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { OrgFormModal } from './OrgFormModal';
import { LocationFormModal } from '../locations/LocationFormModal';
import {
  listOrganizations,
  deleteOrganization,
  activateOrganization,
  deactivateOrganization,
} from '../../api/organizations';
import {
  listLocations,
  deleteLocation,
  activateLocation,
  deactivateLocation,
} from '../../api/locations';
import type { Organization, Location } from '../../types/index';

type OrgModalType = 'create' | 'edit' | 'delete';
type LocModalType = 'create' | 'edit' | 'delete';

interface OrgModal { type: OrgModalType; org?: Organization }
interface LocModal { type: LocModalType; location?: Location; orgId?: string }

function OrgLocations({ orgId, onEdit, onDelete, onToggle }: {
  orgId: string;
  onEdit: (l: Location) => void;
  onDelete: (l: Location) => void;
  onToggle: (l: Location) => void;
}) {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', orgId],
    queryFn: () => listLocations(orgId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <p className="py-3 text-xs text-gray-400 italic">Cargando locaciones…</p>;
  }

  if (!locations?.length) {
    return <p className="py-3 text-xs text-gray-400 italic">Sin locaciones registradas</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-500 border-b border-gray-100">
          <th className="pb-1 text-left font-medium">Locación</th>
          <th className="pb-1 text-left font-medium">Dirección</th>
          <th className="pb-1 text-left font-medium">Capacidad</th>
          <th className="pb-1 text-left font-medium">Estado</th>
          <th className="pb-1 text-left font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {locations.map((l) => (
          <tr key={l.id} className="border-b border-gray-50 last:border-0">
            <td className="py-2 pr-4">
              <p className="font-medium text-gray-800">{l.locationName}</p>
              <p className="text-xs text-gray-400">{l.city}</p>
            </td>
            <td className="py-2 pr-4 text-gray-600">{l.address}</td>
            <td className="py-2 pr-4 text-gray-600">{l.capacity} espacios</td>
            <td className="py-2 pr-4"><Badge status={l.locationStatus} /></td>
            <td className="py-2">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(l)} className="text-xs text-brand-600 hover:underline">Editar</button>
                <button onClick={() => onToggle(l)} className="text-xs text-gray-500 hover:underline">
                  {l.locationStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => onDelete(l)} className="text-xs text-red-600 hover:underline">Eliminar</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function OrganizationsPage() {
  const qc = useQueryClient();
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [orgModal, setOrgModal] = useState<OrgModal | null>(null);
  const [locModal, setLocModal] = useState<LocModal | null>(null);

  const { data: orgs, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
    staleTime: 30_000,
  });

  const toggleOrgMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateOrganization(id) : activateOrganization(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  const deleteOrgMutation = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organizations'] }); setOrgModal(null); },
  });

  const toggleLocMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateLocation(id) : activateLocation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['locations'] }),
  });

  const deleteLocMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['locations'] }); setLocModal(null); },
  });

  const toggleExpand = (id: string) =>
    setExpandedOrgs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <PageHeader
        title="Organizaciones"
        description="Empresas cliente registradas en el sistema"
        action={
          <button
            onClick={() => setOrgModal({ type: 'create' })}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Crear organización
          </button>
        }
      />

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      {isLoading ? (
        <div className="mt-6 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="mt-6 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {!orgs?.length ? (
            <p className="py-10 text-center text-sm text-gray-400">No hay organizaciones registradas</p>
          ) : (
            orgs.map((org) => {
              const expanded = expandedOrgs.has(org.id);
              return (
                <div key={org.id}>
                  {/* Org row */}
                  <div className="flex items-center gap-3 px-4 py-4">
                    <button
                      onClick={() => toggleExpand(org.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      aria-label={expanded ? 'Colapsar' : 'Expandir'}
                    >
                      {expanded
                        ? <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                        : <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/></svg>}
                    </button>

                    {/* Info */}
                    <div className="min-w-0 flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-medium text-gray-900">{org.orgName}</p>
                        <p className="text-xs text-gray-400">{org.rutCompany}</p>
                      </div>
                      <span className="text-sm text-gray-600">{org.orgEmail}</span>
                      <span className="text-sm text-gray-500">{org.phoneNumber ?? '—'}</span>
                      <Badge status={org.orgStatus} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => setLocModal({ type: 'create', orgId: org.id })}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.1.429-.24.706-.435.556-.389 1.284-.966 2.007-1.768C14.625 15.51 16 13.26 16 10a6 6 0 10-12 0c0 3.26 1.375 5.51 2.672 6.579.723.802 1.451 1.379 2.007 1.768.277.195.52.335.706.435a5.741 5.741 0 00.281.14l.018.008.006.003zM10 11.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd"/></svg> Agregar locación
                      </button>
                      <button
                        onClick={() => setOrgModal({ type: 'edit', org })}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleOrgMutation.mutate({ id: org.id, active: org.orgStatus === 'ACTIVE' })}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        {org.orgStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => setOrgModal({ type: 'delete', org })}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Expanded locations */}
                  {expanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-10 py-3">
                      <OrgLocations
                        orgId={org.id}
                        onEdit={(l) => setLocModal({ type: 'edit', location: l, orgId: org.id })}
                        onDelete={(l) => setLocModal({ type: 'delete', location: l })}
                        onToggle={(l) => toggleLocMutation.mutate({ id: l.id, active: l.locationStatus === 'ACTIVE' })}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Org modals */}
      {orgModal?.type === 'create' ? (
        <OrgFormModal onClose={() => setOrgModal(null)} />
      ) : null}
      {orgModal?.type === 'edit' && orgModal.org ? (
        <OrgFormModal org={orgModal.org} onClose={() => setOrgModal(null)} />
      ) : null}
      {orgModal?.type === 'delete' && orgModal.org ? (
        <ConfirmModal
          title="Eliminar organización"
          message={`¿Eliminar "${orgModal.org.orgName}"? Los usuarios asociados quedarán sin organización.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteOrgMutation.isPending}
          onConfirm={() => deleteOrgMutation.mutate(orgModal.org!.id)}
          onCancel={() => setOrgModal(null)}
        />
      ) : null}

      {/* Location modals */}
      {locModal?.type === 'create' && locModal.orgId ? (
        <LocationFormModal orgId={locModal.orgId} onClose={() => setLocModal(null)} />
      ) : null}
      {locModal?.type === 'edit' && locModal.location ? (
        <LocationFormModal location={locModal.location} onClose={() => setLocModal(null)} />
      ) : null}
      {locModal?.type === 'delete' && locModal.location ? (
        <ConfirmModal
          title="Eliminar locación"
          message={`¿Eliminar "${locModal.location.locationName}"?`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteLocMutation.isPending}
          onConfirm={() => deleteLocMutation.mutate(locModal.location!.id)}
          onCancel={() => setLocModal(null)}
        />
      ) : null}
    </div>
  );
}
