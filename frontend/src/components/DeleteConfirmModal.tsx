import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  stallName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  stallName,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-wrapper">
          <AlertTriangle size={32} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Hapus warung ini?
        </h3>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          Apakah Anda yakin ingin menghapus warung <strong>"{stallName}"</strong>?
        </p>

        <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', fontWeight: 500 }}>
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }} />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

