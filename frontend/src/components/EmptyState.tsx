import React from 'react';
import { Store, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Belum ada warung',
  description = 'Tidak ada warung yang sesuai dengan pencarian atau filter Anda.',
  showCreateButton = true,
}) => {
  const { canCreateStall } = useAuth();

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1.5px dashed var(--color-border)',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <Store size={36} />
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
        {description}
      </p>

      {showCreateButton && canCreateStall() && (
        <Link to="/stalls/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Warung Baru</span>
        </Link>
      )}
    </div>
  );
};

