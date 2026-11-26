import React, { useEffect, useState } from 'react';
import { getAuditLogByIdApi } from '../api/audit';
import type { AuditLog } from '../types/audit';
import { getErrorMessage } from '../api/client';
import {
  X,
  Shield,
  User,
  Globe,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Database,
  FileCode,
} from 'lucide-react';

interface AuditDetailModalProps {
  auditId: number | null;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({ auditId, onClose }) => {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) return;

    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAuditLogByIdApi(auditId!);
        if (isMounted) setLog(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [auditId]);

  if (!auditId) return null;

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE')) return 'badge-success';
    if (action.includes('UPDATE')) return 'badge-warning';
    if (action.includes('DELETE')) return 'badge-danger';
    if (action === 'LOGIN') return 'badge-primary';
    if (action === 'LOGOUT') return 'badge-secondary';
    return 'badge-outline';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(43, 27, 30, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalPop 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #EEF2F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAF7F7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light, #F7E9EC)',
                color: 'var(--color-primary, #800020)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text, #2B1B1E)' }}>
                Detail Audit Log #{auditId}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Verifikasi aktivitas mutasi dan autentikasi sistem
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '0.4rem',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span className="spinner spinner-lg" style={{ borderTopColor: 'var(--color-primary, #800020)' }} />
              <p style={{ marginTop: '1rem', color: '#64748B', fontSize: '0.9rem' }}>
                Memuat detail log dari database...
              </p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && log && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Banner Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                    Aksi Terdeteksi
                  </span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className={`badge ${getActionBadgeClass(log.action)}`} style={{ fontSize: '0.875rem', padding: '0.35rem 0.75rem' }}>
                      {log.action}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                    Waktu Dicatat
                  </span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E293B', marginTop: '0.25rem' }}>
                    {new Date(log.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    })}
                  </div>
                </div>
              </div>

              {/* Grid 2 Kolom: Pelaku & Sasaran */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Pelaku / User */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #EEF2F6',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-primary, #800020)', fontWeight: 600 }}>
                    <User size={18} />
                    <span>Informasi Pelaku (User)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>User ID: </span>
                      <strong style={{ color: '#0F172A' }}>#{log.userId}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Nama: </span>
                      <strong style={{ color: '#0F172A' }}>{log.userName || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Email: </span>
                      <strong style={{ color: '#0F172A' }}>{log.userEmail || '-'}</strong>
                    </div>
                  </div>
                </div>

                {/* Target / Sasaran */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #EEF2F6',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-primary, #800020)', fontWeight: 600 }}>
                    <Database size={18} />
                    <span>Sasaran Mutasi (Target)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Tabel Target: </span>
                      <strong style={{ color: '#0F172A' }}>{log.targetTable}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Target ID: </span>
                      <strong style={{ color: '#0F172A' }}>#{log.targetId}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jaringan & Client Context */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #EEF2F6',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-primary, #800020)', fontWeight: 600 }}>
                  <Globe size={18} />
                  <span>Informasi Klien & Jaringan (Wajib Bagian B)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Globe size={16} style={{ color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B' }}>IP Address: </span>
                      <code style={{ backgroundColor: '#F1F5F9', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#0F172A' }}>
                        {log.metadata?.ip_address || '-'}
                      </code>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <Monitor size={16} style={{ color: '#64748B', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#64748B' }}>User Agent: </span>
                      <span style={{ color: '#334155', wordBreak: 'break-all' }}>
                        {log.metadata?.user_agent || '-'}
                      </span>
                    </div>
                  </div>
                  {log.metadata?.result && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={16} style={{ color: '#2E7D32', flexShrink: 0 }} />
                      <div>
                        <span style={{ color: '#64748B' }}>Result: </span>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                          {log.metadata.result}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Lengkap */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                  <FileCode size={16} />
                  <span>Payload Metadata Lengkap</span>
                </div>
                <pre
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    padding: '1rem',
                    borderRadius: '10px',
                    fontSize: '0.825rem',
                    overflowX: 'auto',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #EEF2F6',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#FAF7F7',
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
