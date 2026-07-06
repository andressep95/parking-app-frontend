import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { ClientFormModal } from './ClientFormModal';
import {
  listOrganizations,
  deleteOrganization,
  activateOrganization,
  deactivateOrganization,
} from '../../api/organizations';
import type { Organization } from '../../types/index';

type Modal = { type: 'create' } | { type: 'edit'; org: Organization } | { type: 'delete'; org: Organization };

export function ClientsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modal, setModal] = useState<Modal | null>(null);

  const { data: clients, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
    staleTime: 30_000,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateOrganization(id) : activateOrganization(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setModal(null);
    },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Razones sociales registradas en el sistema"
        action={
          <button
            onClick={() => setModal({ type: 'create' })}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Nuevo cliente
          </button>
        }
      />

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100 ml-auto" />
              </div>
            ))}
          </div>
        ) : !clients?.length ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No hay clientes registrados</p>
            <button
              onClick={() => setModal({ type: 'create' })}
              className="mt-3 text-sm font-medium text-brand-600 underline underline-offset-2"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Teléfono</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{client.orgName}</p>
                    <p className="text-xs text-gray-400">{client.rutCompany}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.orgEmail}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{client.phoneNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge status={client.orgStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center justify-end gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => setModal({ type: 'edit', org: client })}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          toggleMutation.mutate({ id: client.id, active: client.orgStatus === 'ACTIVE' })
                        }
                        className="text-xs text-gray-500 hover:underline"
                      >
                        {client.orgStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => setModal({ type: 'delete', org: client })}
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

      {modal?.type === 'create' ? (
        <ClientFormModal onClose={() => setModal(null)} />
      ) : null}

      {modal?.type === 'edit' ? (
        <ClientFormModal org={modal.org} onClose={() => setModal(null)} />
      ) : null}

      {modal?.type === 'delete' ? (
        <ConfirmModal
          title="Eliminar cliente"
          message={`¿Eliminar "${modal.org.orgName}"? Los usuarios asociados quedarán sin organización.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(modal.org.id)}
          onCancel={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
