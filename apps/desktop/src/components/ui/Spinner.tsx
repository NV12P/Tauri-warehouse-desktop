import './loading.css';

interface SpinnerProps {
  /** Teks alternatif untuk pembaca layar. Kosongkan jika tombol sudah punya teks. */
  label?: string;
  className?: string;
}

/** Spinner kecil untuk tombol atau label, mengikuti warna teks induk. */
export function Spinner({ label, className = '' }: SpinnerProps) {
  return (
    <span
      className={`ui-spinner${className ? ` ${className}` : ''}`}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
