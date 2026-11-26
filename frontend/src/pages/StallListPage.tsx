import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStallsApi } from '../api/stalls';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getFavoriteStallIds, toggleFavoriteStall } from '../utils/favorites';
import type { Stall } from '../types/stall';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Search, MapPin, Star, Plus, ChevronLeft, ChevronRight, Store, Tag, Heart, Utensils } from 'lucide-react';

const CATEGORIES = [
  'Semua Kategori',
  'Nasi',
  'Bakso',
  'Mie',
  'Kwetiau',
  'Soto',
  'Ayam',
  'Minuman',
  'Snack',
];

export const StallListPage: React.FC = () => {
  const { user } = useAuth();

  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(9);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteStallIds(user?.id));
  }, [user]);

  const handleToggleFav = (stallId: number) => {
    toggleFavoriteStall(stallId, user?.id);
    setFavoriteIds(getFavoriteStallIds(user?.id));
  };

  const fetchStalls = useCallback(async (page: number, search: string, category: string) => {
    try {
      setLoading(true);
      setError(null);
      const categoryParam = category === 'Semua Kategori' ? undefined : category;
      const res = await getStallsApi({
        page,
        limit: pageSize,
        search: search.trim() ? search.trim() : undefined,
        category: categoryParam,
      });

      setStalls(res.stalls);
      setTotalCount(res.meta.total);
      setTotalPages(Math.max(1, Math.ceil(res.meta.total / pageSize)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchStalls(currentPage, searchTerm, selectedCategory);
  }, [fetchStalls, currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStalls(1, searchTerm, selectedCategory);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
            Daftar Warung
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Temukan aneka pilihan makanan dan minuman terbaik di kantin kampus.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/favorites" className="btn btn-outline-primary">
            <Heart size={16} />
            <span>Warung Favorit</span>
          </Link>

          <Link to="/stalls/new" className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Warung</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter Bar (FR-2) */}
      <div className="search-filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="form-control"
            placeholder="Cari nama warung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div style={{ minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} color="var(--color-text-muted)" />
          <select
            className="form-control"
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{ cursor: 'pointer' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={() => { setCurrentPage(1); fetchStalls(1, searchTerm, selectedCategory); }} className="btn btn-primary btn-sm">
          Cari
        </button>
      </div>

      {/* Content Rendering based on state */}
      {loading ? (
        <LoadingState message="Memuat daftar warung..." count={6} />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => fetchStalls(currentPage, searchTerm, selectedCategory)}
        />
      ) : stalls.length === 0 ? (
        <EmptyState
          title="Belum ada warung ditemukan"
          description={
            searchTerm || selectedCategory !== 'Semua Kategori'
              ? 'Tidak ada warung yang cocok dengan kata kunci atau filter yang Anda pilih.'
              : 'Belum ada warung yang terdaftar di kantin saat ini.'
          }
        />
      ) : (
        <>
          <div className="stall-grid">
            {stalls.map((stall) => {
              const isFav = favoriteIds.includes(stall.id);
              return (
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

                    {/* Customer Bookmark Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFav(stall.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'transform 0.15s ease',
                      }}
                      title={isFav ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Heart
                        size={17}
                        color={isFav ? '#D32F2F' : 'var(--color-text-muted)'}
                        fill={isFav ? '#D32F2F' : 'none'}
                      />
                    </button>
                  </div>

                  <div className="stall-card-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3 }}>
                        {stall.name}
                      </h3>
                      <div className="rating-badge" title="Rating">
                        <Star size={16} fill="#C9A24B" color="#C9A24B" />
                        <span>{stall.avgRating ? Number(stall.avgRating).toFixed(1) : '0.0'}</span>
                      </div>
                    </div>

                    <div className="stall-meta">
                      <MapPin size={15} color="var(--color-text-muted)" />
                      <span>{stall.location || 'Lokasi kantin'}</span>
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
                      {stall.description || 'Tidak ada deskripsi tersedia untuk warung ini.'}
                    </p>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/stalls/${stall.id}`} className="btn btn-outline-primary" style={{ flex: 1.2, justifyContent: 'center' }}>
                        Lihat Detail
                      </Link>
                      <Link to={`/stalls/${stall.id}/menus`} className="btn btn-primary btn-sm" style={{ flex: 0.8, justifyContent: 'center' }} title="Lihat Menu Warung">
                        <Utensils size={15} />
                        <span>Menu</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination bar (FR-2) */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                <span>Sebelumnya</span>
              </button>

              <span className="pagination-info">
                Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({totalCount} warung)
              </span>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
