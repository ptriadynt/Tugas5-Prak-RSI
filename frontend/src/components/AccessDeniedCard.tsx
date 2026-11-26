import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

interface AccessDeniedCardProps {
  title?: string;
  message?: string;
  redirectPath?: string;
  buttonText?: string;
}

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  title = 'Kamu tidak punya izin untuk membuka halaman ini',
  message = 'Akun kamu tidak memiliki wewenang role untuk mengakses atau mengubah data ini.',
  redirectPath = '/stalls',
  buttonText = 'Kembali ke Daftar Warung',
}) => {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          border: '1px solid #EEF2F6',
          maxWidth: '480px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          animation: 'modalPop 0.25s ease',
        }}
      >
        {/* Soft yellow icon wrapper */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#D97706',
          }}
        >
          <ShieldAlert size={34} strokeWidth={2.2} />
        </div>

        {/* Pill Badge */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              letterSpacing: '0.02em',
            }}
          >
            Error 403 &middot; Akses Ditolak
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.35,
            marginBottom: '0.85rem',
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '0.925rem',
            color: '#64748B',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '380px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {message}
        </p>

        {/* Maroon Return Button */}
        <Link
          to={redirectPath}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            backgroundColor: 'var(--color-primary, #800020)',
            color: '#FFFFFF',
            padding: '0.85rem 1.5rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            boxShadow: '0 4px 14px rgba(128, 0, 32, 0.25)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark, #5C0016)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary, #800020)')}
        >
          <ArrowLeft size={18} />
          <span>{buttonText}</span>
        </Link>
      </div>
    </div>
  );
};

