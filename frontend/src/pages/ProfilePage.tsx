import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Store, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '780px' }}>
      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={36} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
                {user.name}
              </h1>
              <span className={`role-badge ${user.role}`} style={{ fontSize: '0.8rem' }}>
                {user.role}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              {user.email} &bull; ID Pengguna: #{user.id}
            </p>
          </div>
        </div>

        {/* Role Privileges Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            border: '1px solid var(--color-border)',
            marginBottom: '1.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--color-primary)" />
            <span>Hak Akses & Otorisasi Peran ({user.role.toUpperCase()})</span>
          </h3>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.925rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
              <CheckCircle2 size={16} color="var(--color-success)" />
              <span>Melihat daftar warung, detail warung, dan menu makanan/minuman</span>
            </li>

            {user.role === 'customer' && (
              <>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Menyimpan dan mengelola daftar warung favorit</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    * Ingin mendaftarkan warung? Hubungi administrator untuk peningkatan role menjadi Owner.
                  </span>
                </li>
              </>
            )}

            {(user.role === 'owner' || user.role === 'admin') && (
              <>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Mendaftarkan warung baru ke dalam sistem kantin</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Mengubah informasi profil warung {user.role === 'owner' ? 'milik sendiri' : 'seluruh kantin'}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Mengelola menu makanan/minuman, harga, dan ketersediaan stok warung</span>
                </li>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Menghapus data warung di sistem (Hak eksklusif Admin)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  <span>Manajemen pengguna dan pengubahan hak akses role (Admin, Owner, Customer)</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Quick Navigation based on role */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            Aksi Cepat
          </h4>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-primary">
                <Shield size={16} />
                <span>Buka Panel Admin</span>
                <ArrowRight size={14} />
              </Link>
            )}

            {(user.role === 'owner' || user.role === 'admin') && (
              <Link to="/owner/stalls" className="btn btn-outline-primary">
                <Store size={16} />
                <span>Kelola Warung Saya</span>
              </Link>
            )}

            <Link to="/favorites" className="btn btn-outline-primary">
              <Heart size={16} />
              <span>Warung Favorit Saya</span>
            </Link>

            <Link to="/stalls" className="btn btn-outline-primary">
              <span>Jelajahi Warung</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

