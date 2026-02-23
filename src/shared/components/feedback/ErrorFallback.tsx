import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle size={48} className="mb-4 text-[var(--color-error)]" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold text-[var(--color-neutral-700)]">
        Algo deu errado
      </h3>
      <p className="mt-1 max-w-md text-sm text-[var(--color-neutral-500)]">
        {error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
