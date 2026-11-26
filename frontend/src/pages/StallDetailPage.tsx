import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStallByIdApi, deleteStallApi } from '../api/stalls';
import { getStallMenusApi } from '../api/menus';
import { getErrorMessage } from '../api/client';
import { isStallFavorite, toggleFavoriteStall } from '../utils/favorites';
import { useAuth } from '../context/AuthContext';
import type { Stall, MenuItem } from '../types/stall';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ForbiddenBanner } from '../components/ForbiddenBanner';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  MapPin,
  Star,
  Store,
  UserCheck,
  Heart,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';

export const StallDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, canEditStall, canDeleteStall } = useAuth();

  const [stall, setStall] = useState<Stall | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null);
  const [isFav, setIsFav] = useState<boolean>(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchStallData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [stallData, menusData] = await Promise.all([
        getStallByIdApi(id),
        getStallMenusApi(id).catch(() => []),
      ]);
      setStall(stallData);
      setMenus(menusData);
      setIsFav(isStallFavorite(stallData.id, user?.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStallData();
  }, [id, user]);

  const handleFavoriteToggle = () => {
    if (!stall) return;
    const newState = toggleFavoriteStall(stall.id, user?.id);
    setIsFav(newState);
  };

  const handleDeleteConfirm = async () => {
    if (!stall) return;
    try {
      setIsDeleting(true);
      setForbiddenMessage(null);
      await deleteStallApi(stall.id);
      setIsDeleteModalOpen(false);
      navigate('/stalls', { state: { successMessage: `Warung "${stall.name}" berhasil dihapus!` } });
    } catch (err) {
      setIsDeleteModalOpen(false);
      const msg = getErrorMessage(err);
      setForbiddenMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <LoadingState message="Memuat informasi detail warung..." count={2} />
      </div>
    );
  }

  if (error || !stall) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/stalls" className="btn btn-outline-primary btn-sm">
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Warung</span>
          </Link>
        </div>
        <ErrorState
          title="Warung Tidak Ditemukan"
          message={error || 'Data warung tidak ditemukan di sistem (404).'}
          onRetry={fetchStallData}
        />
      </div>
    );
  }

  const isOwner = user && user.role === 'owner' && user.id === stall.ownerId;
  const isAdmin = user && user.role === 'admin';
  const showManageControls = canEditStall(stall) || canDeleteStall() || isOwner;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      {/* Back button & Favorite */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <Link to="/stalls" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar Warung</span>
        </Link>

        {/* Customer Bookmark / Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteToggle}
          className={`btn btn-sm ${isFav ? 'btn-primary' : 'btn-outline-primary'}`}
          title={isFav ? 'Hapus dari Warung Favorit' : 'Simpan ke Warung Favorit'}
        >
          <Heart size={16} fill={isFav ? '#ffffff' : 'none'} color={isFav ? '#ffffff' : 'var(--color-primary)'} />
          <span>{isFav ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}</span>
        </button>
      </div>

      {/* 403 Forbidden Banner if triggered */}
      {forbiddenMessage && (
        <ForbiddenBanner
          message={forbiddenMessage}
          onDismiss={() => setForbiddenMessage(null)}
        />
      )}

      {/* Main Detail Card */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Banner Area */}
        <div
          style={{
            height: '240px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ffffff',
            position: 'relative',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <Store size={72} color="#ffffff" opacity={0.9} style={{ marginBottom: '0.75rem' }} />
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
            {stall.name}
          </h1>
          {stall.category && (
            <span
              style={{
                marginTop: '0.6rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0.3rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              {stall.category}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: '2rem' }}>
          {/* Metadata and Rating Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)' }}>
                <MapPin size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                  {stall.location || 'Kantin Utama Kampus'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)' }}>
                <UserCheck size={18} color="var(--color-accent)" />
                <span>Owner ID: #{stall.ownerId}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--color-accent-light)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  color: '#795500',
                  fontSize: '1.05rem',
                }}
              >
                <Star size={18} fill="#C9A24B" color="#C9A24B" />
                <span>{stall.avgRating ? Number(stall.avgRating).toFixed(1) : '0.0'}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                ({stall.reviewCount ?? 0} ulasan)
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ padding: '1.75rem 0' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
              Tentang Warung
            </h3>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
              {stall.description || 'Belum ada deskripsi yang ditambahkan untuk warung ini.'}
            </p>
          </div>

          {/* Action Buttons for Role (FR-12 & NFR-UI-5) */}
          {showManageControls && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <Link to={`/stalls/${stall.id}/menus`} className="btn btn-primary">
                <UtensilsCrossed size={16} />
                <span>Kelola Menu Warung</span>
              </Link>

              {canEditStall(stall) && (
                <Link to={`/stalls/${stall.id}/edit`} className="btn btn-outline-primary">
                  <Edit3 size={16} />
                  <span>Ubah Profil</span>
                </Link>
              )}

              {(isAdmin || isOwner) && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 size={16} />
                  <span>Hapus Warung</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Section (Customer, Owner, & Admin) */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UtensilsCrossed size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
              Daftar Menu Makanan & Minuman
            </h2>
          </div>

          {showManageControls ? (
            <Link to={`/stalls/${stall.id}/menus`} className="btn btn-outline-primary btn-sm">
              <Plus size={16} />
              <span>Kelola Menu</span>
            </Link>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {menus.length} menu terdaftar
            </span>
          )}
        </div>

        {menus.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
            <p>Warung ini belum mengunggah daftar menu.</p>
            {showManageControls && (
              <Link to={`/stalls/${stall.id}/menus`} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                <Plus size={14} />
                <span>Tambah Menu Sekarang</span>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {menus.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: item.isAvailable ? '3px solid var(--color-success)' : '3px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.name}</span>
                    {item.isAvailable ? (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} />
                        Ada
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#757575', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <XCircle size={12} />
                        Habis
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatRupiah(item.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (FR-6) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        stallName={stall.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
