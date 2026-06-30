import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Badge } from '../../components/Badge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { PageHeader } from '../../components/PageHeader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { TerminalFormModal } from './TerminalFormModal';
import {
  listTerminals,
  deleteTerminal,
  setTerminalMaintenance,
  setTerminalOffline,
} from '../../api/terminals';
import { usePermissions } from '../../hooks/usePermissions';
import type { Column } from '../../components/DataTable';
import type { Terminal } from '../../types/index';

type ModalType = 'create' | 'edit' | 'delete';

interface ActiveModal {
  type: ModalType;
  terminal?: Terminal;
}

export function TerminalsPage() {
  const qc = useQueryClient();
  const { canManageTerminals } = usePermissions();
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  const { data: terminals, isLoading, error, refetch } = useQuery({
    queryKey: ['terminals'],
    queryFn: () => listTerminals(),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const maintenanceMutation = useMutation({
    mutationFn: ({ id, inMaintenance }: { id: string; inMaintenance: boolean }) =>
      inMaintenance ? setTerminalOffline(id) : setTerminalMaintenance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['terminals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTerminal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terminals'] });
      setActiveModal(null);
    },
  });

  const columns: Column<Terminal>[] = [
    {
      key: 'serial',
      header: 'Terminal',
      render: (t) => (
        <div>
          <p className="font-medium text-gray-900">{t.serialNumber}</p>
          <p className="text-xs text-gray-400">{t.model}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (t) => <Badge status={t.status} />,
    },
    {
      key: 'operator',
      header: 'Operador activo',
      render: (t) => (
        <span className="text-sm text-gray-500">{t.activeOperatorId ?? '—'}</span>
      ),
    },
    {
      key: 'version',
      header: 'App versión',
      render: (t) => <span className="text-xs text-gray-500">{t.appVersion ?? '—'}</span>,
    },
    {
      key: 'heartbeat',
      header: 'Último heartbeat',
      render: (t) => (
        <span className="text-xs text-gray-500">
          {t.lastHeartbeat
            ? new Date(t.lastHeartbeat).toLocaleString('es-CL')
            : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (t) => (
        <div className="flex items-center gap-2">
          {canManageTerminals ? (
            <>
              <button
                onClick={() => setActiveModal({ type: 'edit', terminal: t })}
                className="text-xs text-brand-600 hover:underline"
                disabled={t.status === 'ONLINE'}
              >
                Editar
              </button>
              {t.status !== 'ONLINE' ? (
                <button
                  onClick={() =>
                    maintenanceMutation.mutate({
                      id: t.id,
                      inMaintenance: t.status === 'MAINTENANCE',
                    })
                  }
                  className="text-xs text-amber-600 hover:underline"
                >
                  {t.status === 'MAINTENANCE' ? 'Sacar mant.' : 'Mantenimiento'}
                </button>
              ) : null}
              <button
                onClick={() => setActiveModal({ type: 'delete', terminal: t })}
                className="text-xs text-red-600 hover:underline"
                disabled={t.status === 'ONLINE'}
              >
                Eliminar
              </button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Terminales"
        description="Dispositivos POS TUU registrados"
        action={
          canManageTerminals ? (
            <button
              onClick={() => setActiveModal({ type: 'create' })}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Registrar terminal
            </button>
          ) : undefined
        }
      />

      {error !== null ? <ErrorMessage error={error} onRetry={() => refetch()} /> : null}

      <DataTable
        columns={columns}
        data={terminals ?? []}
        keyFn={(t) => t.id}
        isLoading={isLoading}
        emptyMessage="No hay terminales registrados"
      />

      {activeModal?.type === 'create' ? (
        <TerminalFormModal onClose={() => setActiveModal(null)} />
      ) : null}

      {activeModal?.type === 'edit' && activeModal.terminal ? (
        <TerminalFormModal
          terminal={activeModal.terminal}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {activeModal?.type === 'delete' && activeModal.terminal ? (
        <ConfirmModal
          title="Eliminar terminal"
          message={`¿Eliminar el terminal "${activeModal.terminal.serialNumber}"? Esta acción es irreversible.`}
          confirmLabel="Eliminar"
          danger
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(activeModal.terminal!.id)}
          onCancel={() => setActiveModal(null)}
        />
      ) : null}
    </div>
  );
}
