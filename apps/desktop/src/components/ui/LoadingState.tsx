import './loading.css';

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

/** Loading saat memuat data halaman atau konten modal. */
export function LoadingState({
  message = 'Memuat data...',
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={`loading-state${compact ? ' loading-state--compact' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-state__spinner" aria-hidden="true" />
      <span className="loading-state__message">{message}</span>
    </div>
  );
}
