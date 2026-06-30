import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createTerminal, updateTerminal } from '../../api/terminals';
import { listOrganizations } from '../../api/organizations';
import type { Terminal, CreateTerminalRequest, UpdateTerminalRequest } from '../../types/index';

interface Props {
  terminal?: Terminal;
  prefillOrgId?: string;
  onClose: () => void;
}

export function TerminalFormModal({ terminal, prefillOrgId, onClose }: Props) {
  const isEdit = terminal !== undefined;
  const qc = useQueryClient();

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
    enabled: !prefillOrgId && !isEdit,
    staleTime: 60_000,
  });

  const [form, setForm] = useState({
    serialNumber: terminal?.serialNumber ?? '',
    model: terminal?.model ?? '',
    orgId: terminal?.orgId ?? prefillOrgId ?? '',
    appVersion: terminal?.appVersion ?? '',
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateTerminalRequest = {
          model: form.model || undefined,
          appVersion: form.appVersion || undefined,
        };
        return updateTerminal(terminal.id, payload);
      }
      const payload: CreateTerminalRequest = {
        serialNumber: form.serialNumber,
        model: form.model,
        orgId: form.orgId,
        appVersion: form.appVersion || undefined,
      };
      return createTerminal(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terminals'] });
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
    <FormModal title={isEdit ? 'Editar terminal' : 'Registrar terminal'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Número de serie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.serialNumber}
              onChange={(e) => set('serialNumber', e.target.value)}
              placeholder="TUU-2024-001"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              El número de serie es inmutable una vez registrado.
            </p>
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Modelo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="TUU Pro"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {!isEdit && !prefillOrgId ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={form.orgId}
              onChange={(e) => set('orgId', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Seleccionar cliente —</option>
              {orgs?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orgName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Versión de app</label>
          <input
            type="text"
            value={form.appVersion}
            onChange={(e) => set('appVersion', e.target.value)}
            placeholder="2.3.1"
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
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar terminal'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
