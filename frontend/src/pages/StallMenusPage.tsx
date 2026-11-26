import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStallByIdApi } from '../api/stalls';
import { getStallMenusApi, createMenuItemApi, updateMenuItemApi, deleteMenuItemApi } from '../api/menus';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Stall, MenuItem } from '../types/stall';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import {
  ArrowLeft,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  X,
  AlertCircle,
  Tag,
  DollarSign,
} from 'lucide-react';

export const StallMenusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const stallId = Number(id);
  const { canEditStall } = useAuth();

  const [stall, setStall] = useState<Stall | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form add/edit state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [menuName, setMenuName] = useState<string>('');
  const [menuPrice, setMenuPrice] = useState<number | string>('');
  const [menuAvailable, setMenuAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isOwnerOrAdmin = stall ? canEditStall(stall) : false;

  const loadData = async () => {
    if (!stallId) return;
    try {
      setLoading(true);
      setError(null);
      const [stallData, menusData] = await Promise.all([
        getStallByIdApi(stallId),
        getStallMenusApi(stallId),
      ]);
      setStall(stallData);
      setMenus(menusData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [stallId]);

  const openAddForm = () => {
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuAvailable(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setMenuName(item.name);
    setMenuPrice(item.price);
    setMenuAvailable(item.isAvailable);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) {
      setFormError('Nama menu wajib diisi.');
      return;
    }
    const priceNum = Number(menuPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Harga harus berupa angka positif.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      if (editingMenuId) {
        const updated = await updateMenuItemApi(editingMenuId, {
          name: menuName.trim(),
          price: priceNum,
          isAvailable: menuAvailable,
        });
        setMenus((prev) =>
          prev.map((m) => (m.id === editingMenuId ? { ...m, ...updated, price: priceNum, isAvailable: menuAvailable } : m))
        );
        setSuccessMessage('Menu berhasil diperbarui!');
      } else {
        const created = await createMenuItemApi({
          stallId,
          name: menuName.trim(),
          price: priceNum,
          isAvailable: menuAvailable,
        });
        setMenus((prev) => [...prev, created]);
        setSuccessMessage('Menu baru berhasil ditambahkan!');
      }

      setIsFormOpen(false);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    try {
      await deleteMenuItemApi(menuId);
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
      setSuccessMessage('Menu berhasil dihapus.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      setError(getErrorMessage(err));
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
        <LoadingState message="Memuat daftar menu warung..." count={2} />
      </div>
    );
  }

  if (error || !stall) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <ErrorState message={error || 'Warung tidak ditemukan'} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '960px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={`/stalls/${stall.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <ArrowLeft size={18} />
          <span>Kembali ke Detail Warung</span>
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
            Daftar Menu: {stall.name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            {isOwnerOrAdmin
              ? 'Kelola daftar makanan, minuman, harga, dan ketersediaan stok warung Anda.'
              : 'Pilihan sajian makanan & minuman yang tersedia di warung ini.'}
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button onClick={openAddForm} className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Menu Baru</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Modal / Inline Form for Add & Edit */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
                {editingMenuId ? 'Ubah Menu Makanan / Minuman' : 'Tambah Menu Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-error" style={{ padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="menu-name">
                  Nama Menu <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    id="menu-name"
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Ayam Geprek Sambal Matah"
                    style={{ paddingLeft: '2.5rem' }}
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="menu-price">
                  Harga (Rupiah) <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    id="menu-price"
                    type="number"
                    min="0"
                    step="500"
                    className="form-control"
                    placeholder="Contoh: 15000"
                    style={{ paddingLeft: '2.5rem' }}
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={menuAvailable}
                    onChange={(e) => setMenuAvailable(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontWeight: 500 }}>Menu Sedang Tersedia (Ready Stock)</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner spinner-sm" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Simpan Menu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menus List */}
      {menus.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <UtensilsCrossed size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Belum Ada Menu Terdaftar
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {isOwnerOrAdmin
              ? 'Warung ini belum memiliki daftar menu. Tambahkan menu pertama Anda sekarang!'
              : 'Warung ini belum mengunggah daftar menu makanan atau minuman.'}
          </p>
          {isOwnerOrAdmin && (
            <button onClick={openAddForm} className="btn btn-primary">
              <Plus size={18} />
              <span>Tambah Menu Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {menus.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: item.isAvailable ? '4px solid var(--color-success)' : '4px solid var(--color-border)',
                opacity: item.isAvailable ? 1 : 0.75,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    {item.name}
                  </h4>
                  {item.isAvailable ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-success-bg)',
                        color: 'var(--color-success)',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Tersedia
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#EEEEEE',
                        color: '#757575',
                      }}
                    >
                      <XCircle size={12} />
                      Habis
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {formatRupiah(item.price)}
                </div>
              </div>

              {isOwnerOrAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="btn btn-outline-primary btn-sm"
                    title="Ubah Menu"
                  >
                    <Edit2 size={14} />
                    <span>Ubah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMenu(item.id)}
                    className="btn btn-outline-danger btn-sm"
                    title="Hapus Menu"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
