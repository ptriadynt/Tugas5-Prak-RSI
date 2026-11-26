import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStallByIdApi, createStallApi, updateStallApi } from '../api/stalls';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { ForbiddenBanner } from '../components/ForbiddenBanner';
import { AccessDeniedCard } from '../components/AccessDeniedCard';
import { Save, ArrowLeft, AlertCircle, Store } from 'lucide-react';

export const StallFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [loadingStall, setLoadingStall] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validation errors per field
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  useEffect(() => {
    // Customer tidak diizinkan membuat atau mengubah warung
    if (user?.role === 'customer') {
      setForbiddenError(
        'Akses Ditolak (403 Forbidden): Akun Anda memiliki peran Customer. Pelanggan tidak memiliki izin untuk menambahkan atau mengubah warung. Fitur ini hanya dapat diakses oleh Pemilik Warung (Owner) atau Administrator.'
      );
      return;
    }

    if (isEditMode && id) {
      async function loadStall() {
        try {
          setLoadingStall(true);
          const stall = await getStallByIdApi(id as string);
          setName(stall.name || '');
          setCategory(stall.category || '');
          setLocation(stall.location || '');
          setDescription(stall.description || '');

          if (user?.role === 'owner' && stall.ownerId !== user.id) {
            setForbiddenError('Anda bukan pemilik warung ini. Hanya pemilik yang dapat mengubah warung ini (403 Forbidden).');
          }
        } catch (err) {
          setServerError(getErrorMessage(err));
        } finally {
          setLoadingStall(false);
        }
      }
      loadStall();
    }
  }, [id, isEditMode, user]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Nama warung wajib diisi';
    } else if (name.trim().length < 3) {
      errors.name = 'Nama warung minimal 3 karakter';
    } else if (name.trim().length > 100) {
      errors.name = 'Nama warung maksimal 100 karakter';
    }

    if (category && category.trim().length > 50) {
      errors.category = 'Kategori maksimal 50 karakter';
    }

    if (location && location.trim().length > 100) {
      errors.location = 'Lokasi maksimal 100 karakter';
    }

    if (description && description.trim().length > 1000) {
      errors.description = 'Deskripsi maksimal 1000 karakter';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setForbiddenError(null);

    if (user?.role === 'customer') {
      setForbiddenError('Pelanggan (Customer) tidak memiliki izin untuk menambahkan atau mengubah warung.');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        category: category.trim() || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (isEditMode && id) {
        await updateStallApi(id, payload);
        navigate(`/stalls/${id}`, {
          state: { successMessage: 'Data warung berhasil diperbarui!' },
        });
      } else {
        const created = await createStallApi(payload);
        navigate(`/stalls/${created.id}`, {
          state: { successMessage: 'Warung baru berhasil ditambahkan!' },
        });
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) {
        setForbiddenError(getErrorMessage(err));
      } else {
        setServerError(getErrorMessage(err));
      }

      // Map backend validation field issues if any
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorsObj: { [key: string]: string } = {};
        for (const issue of err.response.data.errors) {
          if (issue.field) {
            errorsObj[issue.field] = issue.message;
          }
        }
        setFieldErrors(errorsObj);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStall) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '640px' }}>
        <LoadingState message="Memuat data formulir warung..." count={1} />
      </div>
    );
  }

  // Tampilan Akses Ditolak 403 persis seperti desain yang diminta jika Customer mencoba menambah/mengubah warung
  if (user?.role === 'customer') {
    return (
      <AccessDeniedCard
        title="Kamu tidak punya izin untuk membuka halaman ini"
        message="Akun kamu tidak memiliki wewenang role untuk mengakses atau mengubah data ini."
        redirectPath="/stalls"
        buttonText="Kembali ke Daftar Warung"
      />
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '680px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to={isEditMode && id ? `/stalls/${id}` : '/stalls'} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <ArrowLeft size={18} />
          <span>{isEditMode ? 'Kembali ke Detail' : 'Kembali ke Daftar Warung'}</span>
        </Link>
      </div>

      {forbiddenError && (
        <ForbiddenBanner message={forbiddenError} />
      )}

      {serverError && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{serverError}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
              {isEditMode ? 'Ubah Data Warung' : 'Tambah Warung'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {isEditMode ? 'Perbarui informasi profil warung kantin.' : 'Isi formulir di bawah untuk mendaftarkan warung baru.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Nama Warung */}
          <div className="form-group">
            <label className="form-label" htmlFor="stall-name">
              Nama Warung <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="stall-name"
              type="text"
              className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
              placeholder="Contoh: Warung Soto Barokah"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
              }}
              disabled={isSubmitting || Boolean(forbiddenError)}
            />
            {fieldErrors.name && (
              <div className="invalid-feedback">
                <AlertCircle size={14} />
                <span>{fieldErrors.name}</span>
              </div>
            )}
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="stall-category">
              Kategori
            </label>
            <input
              id="stall-category"
              type="text"
              className={`form-control ${fieldErrors.category ? 'is-invalid' : ''}`}
              placeholder="Contoh: Nasi, Soto, Bakso, Minuman"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: '' });
              }}
              disabled={isSubmitting || Boolean(forbiddenError)}
            />
            {fieldErrors.category && (
              <div className="invalid-feedback">
                <AlertCircle size={14} />
                <span>{fieldErrors.category}</span>
              </div>
            )}
          </div>

          {/* Lokasi */}
          <div className="form-group">
            <label className="form-label" htmlFor="stall-location">
              Lokasi
            </label>
            <input
              id="stall-location"
              type="text"
              className={`form-control ${fieldErrors.location ? 'is-invalid' : ''}`}
              placeholder="Contoh: Kantin FMIPA Lantai 1"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: '' });
              }}
              disabled={isSubmitting || Boolean(forbiddenError)}
            />
            {fieldErrors.location && (
              <div className="invalid-feedback">
                <AlertCircle size={14} />
                <span>{fieldErrors.location}</span>
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label className="form-label" htmlFor="stall-description">
              Deskripsi
            </label>
            <textarea
              id="stall-description"
              rows={4}
              className={`form-control ${fieldErrors.description ? 'is-invalid' : ''}`}
              placeholder="Jelaskan menu andalan, jam buka, atau keunikan warung..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
              }}
              disabled={isSubmitting || Boolean(forbiddenError)}
            />
            {fieldErrors.description && (
              <div className="invalid-feedback">
                <AlertCircle size={14} />
                <span>{fieldErrors.description}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate(isEditMode && id ? `/stalls/${id}` : '/stalls')}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || Boolean(forbiddenError)}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }} />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
