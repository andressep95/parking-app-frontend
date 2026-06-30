import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { createUser, updateUser } from '../../api/users';
import { listOrganizations } from '../../api/organizations';
import { listLocations } from '../../api/locations';
import { usePermissions } from '../../hooks/usePermissions';
import type { User, UserRole, CreateUserRequest, UpdateUserRequest } from '../../types/index';

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
  user?: User;
  onClose: () => void;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'CUSTOMER', label: 'Cliente (dueño org)' },
  { value: 'OPERATOR', label: 'Operador POS' },
];

export function UserFormModal({ user, onClose }: Props) {
  const isEdit = user !== undefined;
  const qc = useQueryClient();
  const { isAdmin } = usePermissions();

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: listOrganizations,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const [form, setForm] = useState({
    rut: user?.rut ?? '',
    password: '',
    email: user?.email ?? '',
    givenName: user?.givenName ?? '',
    familyName: user?.familyName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    role: (user?.role ?? 'OPERATOR') as UserRole,
    orgId: user?.orgId ?? '',
    locationId: user?.locationId ?? '',
  });

  const [rutError, setRutError] = useState('');

  const { data: locations } = useQuery({
    queryKey: ['locations', form.orgId],
    queryFn: () => listLocations(form.orgId),
    enabled: form.orgId !== '',
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (isEdit) {
        const payload: UpdateUserRequest = {
          email: form.email || undefined,
          givenName: form.givenName || undefined,
          familyName: form.familyName || undefined,
          phoneNumber: form.phoneNumber || undefined,
          locationId: form.locationId || undefined,
        };
        return updateUser(user.id, payload);
      }
      const payload: CreateUserRequest = {
        rut: form.rut,
        password: form.password,
        email: form.email,
        givenName: form.givenName,
        familyName: form.familyName,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
        orgId: form.orgId || undefined,
        locationId: form.locationId || undefined,
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
    if (!isEdit && !validateRut(form.rut)) {
      setRutError('RUT inválido (verifica el dígito verificador)');
      return;
    }
    setRutError('');
    mutation.mutate();
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <FormModal title={isEdit ? 'Editar usuario' : 'Crear usuario'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit ? (
          <>
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
              {rutError !== '' ? <p className="mt-1 text-xs text-red-600">{rutError}</p> : null}
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
          </>
        ) : null}

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

        {!isEdit ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} disabled={!isAdmin && r.value !== 'OPERATOR'}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {isAdmin && orgs ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Organización</label>
            <select
              value={form.orgId}
              onChange={(e) => set('orgId', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Sin asignar —</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orgName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {locations && locations.length > 0 ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Locación</label>
            <select
              value={form.locationId}
              onChange={(e) => set('locationId', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Sin asignar —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.locationName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {mutation.isError ? (
          <ErrorMessage error={mutation.error} />
        ) : null}

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
            {mutation.isPending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
