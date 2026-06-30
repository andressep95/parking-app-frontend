import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FormModal } from '../../components/FormModal';
import { ErrorMessage } from '../../components/ErrorMessage';
import { resetPassword } from '../../api/users';
import type { User } from '../../types/index';

interface Props {
  user: User;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: Props) {
  const [newPassword, setNewPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => resetPassword(user.id, newPassword),
    onSuccess: onClose,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <FormModal title="Resetear contraseña" onClose={onClose}>
      <p className="mb-4 text-sm text-gray-500">
        Usuario: <strong>{user.givenName} {user.familyName}</strong> ({user.rut})
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nueva contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 10 caracteres, mayúsculas, minúsculas y números"
            required
            minLength={10}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            La contraseña se aplica de forma permanente (no requiere cambio en el próximo login).
          </p>
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
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Aplicando...' : 'Resetear contraseña'}
          </button>
        </div>
      </form>
    </FormModal>
  );
}
