import React from 'react';

interface LoadingStateProps {
  message?: string;
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Memuat data warung...', count = 6 }) => {
  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <div className="spinner" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
      </div>

      <div className="stall-grid">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton" style={{ height: '160px', width: '100%' }} />
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <div className="skeleton" style={{ height: '22px', width: '70%' }} />
              <div className="skeleton" style={{ height: '16px', width: '45%' }} />
              <div className="skeleton" style={{ height: '14px', width: '90%', marginTop: 'auto' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: '0.5rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

