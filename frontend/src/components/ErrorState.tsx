import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Gagal memuat data',
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-error-bg)',
        boxShadow: 'var(--shadow-sm)',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <AlertCircle size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-error)', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
        {message}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline-primary">
          <RefreshCw size={16} />
          <span>Coba Lagi</span>
        </button>
      )}
    </div>
  );
};

