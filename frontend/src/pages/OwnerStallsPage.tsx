import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStallsApi } from '../api/stalls';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Stall } from '../types/stall';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Store, Plus, Edit, UtensilsCrossed, ExternalLink, MapPin, Star } from 'lucide-react';

export const OwnerStallsPage: React.FC = () => {
  const { user } = useAuth();
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOwnerStalls = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all stalls and filter by ownerId
      const res = await getStallsApi({ page: 1, limit: 100 });
      const myStalls = res.stalls.filter((s) => s.ownerId === user?.id);
      setStalls(myStalls);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerStalls();
  }, [user]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="role-badge owner" style={{ fontSize: '0.8rem' }}>
              <Store size={14} />
              PEMILIK WARUNG
            </span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
              Warung Kelolaan Saya
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Kelola data warung dan menu makanan/minuman yang Anda miliki di kantin.
          </p>
        </div>

        <Link to="/stalls/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Warung Baru</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Memuat warung Anda..." count={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOwnerStalls} />
      ) : stalls.length === 0 ? (
        <EmptyState
          title="Anda belum memiliki warung"
          description="Mulai daftarkan warung kantin Anda untuk dapat mengelola menu dan menyapa pelanggan kampus!"
          showCreateButton={true}
        />
      ) : (
        <div className="stall-grid">
          {stalls.map((stall) => (
            <div key={stall.id} className="card stall-card">
              <div className="stall-card-image">
                <Store size={56} color="var(--color-primary)" opacity={0.85} />
                {stall.category && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {stall.category}
                  </span>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'var(--color-accent)',
                    color: '#2B1B1E',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  WARUNG SAYA
                </span>
              </div>

              <div className="stall-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3 }}>
                    {stall.name}
                  </h3>
                  <div className="rating-badge">
                    <Star size={16} fill="#C9A24B" color="#C9A24B" />
                    <span>{stall.avgRating ? Number(stall.avgRating).toFixed(1) : '0.0'}</span>
                  </div>
                </div>

                <div className="stall-meta">
                  <MapPin size={15} color="var(--color-text-muted)" />
                  <span>{stall.location || 'Lokasi belum disetel'}</span>
                  <span>&bull;</span>
                  <span>{stall.reviewCount ?? 0} ulasan</span>
                </div>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.8rem',
                    marginBottom: '1.25rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {stall.description || 'Tidak ada deskripsi tersedia.'}
                </p>

                {/* Quick Owner Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link
                    to={`/stalls/${stall.id}/menus`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <UtensilsCrossed size={16} />
                    <span>Kelola Menu Warung</span>
                  </Link>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/stalls/${stall.id}/edit`}
                      className="btn btn-outline-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit size={14} />
                      <span>Ubah Profil</span>
                    </Link>
                    <Link
                      to={`/stalls/${stall.id}`}
                      className="btn btn-outline-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <ExternalLink size={14} />
                      <span>Lihat Detail</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

