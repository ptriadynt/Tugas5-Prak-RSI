import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStallsApi } from '../api/stalls';
import { getFavoriteStallIds, toggleFavoriteStall } from '../utils/favorites';
import { useAuth } from '../context/AuthContext';
import type { Stall } from '../types/stall';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Heart, Star, MapPin, Store, Utensils } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favoriteStalls, setFavoriteStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favIds = getFavoriteStallIds(user?.id);
      if (favIds.length === 0) {
        setFavoriteStalls([]);
        return;
      }

      const res = await getStallsApi({ page: 1, limit: 100 });
      const matched = res.stalls.filter((s) => favIds.includes(s.id));
      setFavoriteStalls(matched);
    } catch (err) {
      console.error('Gagal memuat warung favorit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleToggleFavorite = (stallId: number) => {
    toggleFavoriteStall(stallId, user?.id);
    setFavoriteStalls((prev) => prev.filter((s) => s.id !== stallId));
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Heart size={24} color="#D32F2F" fill="#D32F2F" />
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
            Warung Favorit Saya
          </h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
          Daftar warung kantin langganan yang Anda simpan untuk akses lebih cepat.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Memuat warung favorit..." count={3} />
      ) : favoriteStalls.length === 0 ? (
        <EmptyState
          title="Belum ada warung favorit"
          description="Anda belum menambahkan warung ke daftar favorit. Klik ikon hati pada kartu warung yang Anda sukai!"
          showCreateButton={false}
        />
      ) : (
        <div className="stall-grid">
          {favoriteStalls.map((stall) => (
            <div key={stall.id} className="card stall-card">
              <div className="stall-card-image">
                <Store size={56} color="var(--color-primary)" opacity={0.8} />
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
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(stall.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  title="Hapus dari Favorit"
                >
                  <Heart size={18} color="#D32F2F" fill="#D32F2F" />
                </button>
              </div>

              <div className="stall-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3 }}>
                    {stall.name}
                  </h3>
                  <div className="rating-badge">
                    <Star size={16} fill="#C9A24B" color="#C9A24B" />
                    <span>{stall.avgRating ? Number(stall.avgRating).toFixed(1) : '0.0'}</span>
                  </div>
                </div>

                <div className="stall-meta">
                  <MapPin size={15} color="var(--color-text-muted)" />
                  <span>{stall.location || 'Lokasi kantin'}</span>
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

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/stalls/${stall.id}`} className="btn btn-outline-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    Lihat Detail
                  </Link>
                  <Link to={`/stalls/${stall.id}/menus`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Utensils size={15} />
                    <span>Menu</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

