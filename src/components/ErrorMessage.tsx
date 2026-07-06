import axios from 'axios';

interface Props {
  error: unknown;
  onRetry?: () => void;
}

function extractMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; code?: string } | undefined;
    return data?.message ?? data?.code ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}

export function ErrorMessage({ error, onRetry }: Props) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">{extractMessage(error)}</p>
      {onRetry !== undefined ? (
        <button
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-red-700 underline"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
