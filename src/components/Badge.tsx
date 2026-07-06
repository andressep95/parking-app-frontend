import type { LocationStatus, OrgStatus, TerminalStatus, UserStatus } from '../types/index';

type Status = UserStatus | OrgStatus | LocationStatus | TerminalStatus;

const CLASSES: Record<string, string> = {
  ACTIVE: 'bg-success-50 text-success-700 border border-success-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border border-gray-200',
  ONLINE: 'bg-success-50 text-success-700 border border-success-200',
  OFFLINE: 'bg-red-50 text-red-700 border border-red-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border border-amber-200',
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
