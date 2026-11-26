import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ForbiddenBannerProps {
  message?: string;
  onDismiss?: () => void;
}

export const ForbiddenBanner: React.FC<ForbiddenBannerProps> = ({
  message = 'Anda tidak punya izin untuk aksi ini.',
  onDismiss,
}) => {
  return (
    <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldAlert size={20} />
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

