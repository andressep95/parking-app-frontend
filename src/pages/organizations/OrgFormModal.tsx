import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createOrganization, updateOrganization } from '../../api/organizations';
import { listUsers } from '../../api/users';
import type { Organization, CreateOrganizationRequest, UpdateOrganizationRequest } from '../../types/index';

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

interface Props {
  org?: Organization;
  onClose: () => void;
}

export function OrgFormModal({ org, onClose }: Props) {
  const isEdit = org !== undefined;
  const qc = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['users-customers'],
    queryFn: () => listUsers(),
    staleTime: 60_000,
  });

  const customerUsers = customers?.filter((u) => u.role === 'CUSTOMER') ?? [];

  const [form, setForm] = useState({
    orgName: org?.orgName ?? '',
    rutCompany: org?.rutCompany ?? '',
    orgEmail: org?.orgEmail ?? '',
    phoneNumber: org?.phoneNumber ?? '',
    adminUserId: org?.adminUserId ?? '',
  });

  const [rutError, setRutError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const payload: UpdateOrganizationRequest = {
          orgName: form.orgName || undefined,
          rutCompany: form.rutCompany || undefined,
          orgEmail: form.orgEmail || undefined,
          phoneNumber: form.phoneNumber || undefined,
        };
        await updateOrganization(org.id, payload);
        return org;
      }
      const payload: CreateOrganizationRequest = {
        orgName: form.orgName,
        rutCompany: form.rutCompany,
        orgEmail: form.orgEmail,
        phoneNumber: form.phoneNumber || undefined,
        adminUserId: form.adminUserId,
      };
      return createOrganization(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRut(form.rutCompany)) {
      setRutError('RUT de empresa inválido');
      return;
    }
    setRutError('');
    mutation.mutate();
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <FormModal title={isEdit ? 'Editar organización' : 'Crear organización'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) => set('orgName', e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            RUT empresa <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.rutCompany}
            onChange={(e) => set('rutCompany', e.target.value)}
            placeholder="76000000-0"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {rutError !== '' ? <p className="mt-1 text-xs text-red-600">{rutError}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.orgEmail}
            onChange={(e) => set('orgEmail', e.target.value)}
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

        {!isEdit ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Admin (CUSTOMER) <span className="text-red-500">*</span>
            </label>
            <select
              value={form.adminUserId}
              onChange={(e) => set('adminUserId', e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Seleccionar usuario CUSTOMER —</option>
              {customerUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.givenName} {u.familyName} ({u.rut})
                </option>
              ))}
            </select>
          </div>
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
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear organización'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
