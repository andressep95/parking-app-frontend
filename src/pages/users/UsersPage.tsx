import { useState, useTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { UserFormModal } from './UserFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { listUsers, deleteUser, activateUser, deactivateUser, forceLogout } from '../../api/users';
import { usePermissions } from '../../hooks/usePermissions';
import type { Column } from '../../components/DataTable';
import type { User } from '../../types/index';

type ModalType = 'create' | 'edit' | 'delete' | 'resetPassword' | 'forceLogout';

interface ActiveModal {
  type: ModalType;
  user?: User;
}

export function UsersPage() {
  const qc = useQueryClient();
  const { isAdmin, canDeleteUsers, canResetPasswords, canForceLogout } = usePermissions();
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);
  const [, startTransition] = useTransition();
  const [orgFilter, setOrgFilter] = useState('');

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', orgFilter],
    queryFn: () => listUsers(orgFilter || undefined),
    staleTime: 30_000,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateUser(id) : activateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setActiveModal(null);
    },
  });

  const forceLogoutMutation = useMutation({
    mutationFn: (id: string) => forceLogout(id),
    onSuccess: () => setActiveModal(null),
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (u) => (
        <div>
          <p className="font-medium text-gray-900">
            {u.givenName} {u.familyName}
          </p>
          <p className="text-xs text-gray-400">{u.rut}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (u) => <span className="text-gray-600">{u.email}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (u) => <Badge status={u.userStatus} />,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (u) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal({ type: 'edit', user: u })}
            className="text-xs text-brand-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() =>
              toggleStatusMutation.mutate({ id: u.id, active: u.userStatus === 'ACTIVE' })
            }
            className="text-xs text-gray-500 hover:underline"
          >
            {u.userStatus === 'ACTIVE' ? 'Desactivar' : 'Activar'}
          </button>
          {canResetPasswords ? (
            <button
              onClick={() => setActiveModal({ type: 'resetPassword', user: u })}
              className="text-xs text-amber-600 hover:underline"
            >
              Resetear pwd
            </button>
          ) : null}
          {canForceLogout ? (
            <button
              onClick={() => setActiveModal({ type: 'forceLogout', user: u })}
              className="text-xs text-orange-600 hover:underline"
            >
              Cerrar sesión
            </button>
          ) : null}
          {canDeleteUsers ? (
            <button
              onClick={() => setActiveModal({ type: 'delete', user: u })}
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
        title="Usuarios"
        description="Gestiona los accesos al sistema"
        action={
          <button
            onClick={() => setActiveModal({ type: 'create' })}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Crear usuario
          </button>
        }
      />

      {isAdmin ? (
        <div className="mb-4">
          <input
            type="text"
            value={orgFilter}
            onChange={(e) => {
              const val = e.target.value;
              startTransition(() => setOrgFilter(val));
            }}
            placeholder="Filtrar por org ID..."
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      ) : null}

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      <DataTable
        columns={columns}
        data={users ?? []}
        keyFn={(u) => u.id}
        isLoading={isLoading}
        emptyMessage="No hay usuarios registrados"
      />

      {activeModal?.type === 'create' ? (
        <UserFormModal onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'edit' && activeModal.user ? (
        <UserFormModal user={activeModal.user} onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'resetPassword' && activeModal.user ? (
        <ResetPasswordModal user={activeModal.user} onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'delete' && activeModal.user ? (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a ${activeModal.user.givenName} ${activeModal.user.familyName} (${activeModal.user.rut})? Esta acción es irreversible.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(activeModal.user!.id)}
          onCancel={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal?.type === 'forceLogout' && activeModal.user ? (
        <ConfirmModal
          title="Forzar cierre de sesión"
          message={`¿Cerrar la sesión activa de ${activeModal.user.givenName} ${activeModal.user.familyName}? Su refresh token quedará revocado en Cognito.`}
          confirmLabel="Forzar cierre"
          danger
          isLoading={forceLogoutMutation.isPending}
          onConfirm={() => forceLogoutMutation.mutate(activeModal.user!.id)}
          onCancel={() => setActiveModal(null)}
        />
      ) : null}
    </div>
  );
}
