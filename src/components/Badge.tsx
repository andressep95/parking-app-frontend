import type { LocationStatus, OrgStatus, TerminalStatus, UserStatus } from '../types/index';

type Status = UserStatus | OrgStatus | LocationStatus | TerminalStatus;

const CLASSES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ONLINE: 'bg-green-100 text-green-800',
  OFFLINE: 'bg-red-100 text-red-700',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

const LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  ONLINE: 'En línea',
  OFFLINE: 'Desconectado',
  MAINTENANCE: 'Mantenimiento',
};

interface Props {
  status: Status;
}

export function Badge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CLASSES[status] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
