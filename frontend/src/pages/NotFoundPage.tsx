import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
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
          margin: '0 auto 1.5rem',
        }}
      >
        <AlertTriangle size={36} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1rem' }}>
        Halaman Tidak Ditemukan
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 2rem' }}>
        Halaman yang Anda tuju tidak ditemukan atau URL mungkin salah.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
};

