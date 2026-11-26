import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { UtensilsCrossed, UserPlus, AlertCircle, User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Nama lengkap wajib diisi';
    } else if (name.trim().length < 3) {
      errors.name = 'Nama minimal 3 karakter';
    } else if (name.trim().length > 100) {
      errors.name = 'Nama maksimal 100 karakter';
    }

    if (!email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!password) {
      errors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    } else if (password.length > 72) {
      errors.password = 'Password maksimal 72 karakter';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate('/login', {
        state: { successMessage: 'Registrasi berhasil! Silakan masuk dengan akun baru Anda.' },
      });
    } catch (err: any) {
      setServerError(getErrorMessage(err));
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
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <div className="auth-split-wrapper">
        {/* Left Side: Maroon Panel */}
        <div className="auth-panel-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UtensilsCrossed size={32} color="#C9A24B" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Kantin</h2>
          </div>

          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '1rem', color: '#ffffff' }}>
            Bergabung dengan Komunitas Kantin
          </h3>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.975rem', lineHeight: 1.6, maxWidth: '340px' }}>
            Daftarkan diri Anda untuk menjelajahi seluruh sajian kantin, melihat informasi warung terlengkap, dan menikmati kemudahan eksplorasi menu kampus.
          </p>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '2rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.65)',
            }}
          >
            <span>Praktikum Rekayasa Sistem Informasi 2026</span>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="auth-panel-form">
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
              Buat Akun Baru
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
              Lengkapi data di bawah ini untuk memulai pendaftaran.
            </p>
          </div>

          {serverError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Nama Lengkap */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Nama Lengkap
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="register-name"
                  type="text"
                  className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                  placeholder="Contoh: Budi Santoso"
                  style={{ paddingLeft: '2.5rem' }}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.name && (
                <div className="invalid-feedback">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="register-email"
                  type="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="nama@email.com"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <div className="invalid-feedback">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="register-password"
                  type="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  placeholder="Minimal 8 karakter"
                  style={{ paddingLeft: '2.5rem' }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.password && (
                <div className="invalid-feedback">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Konfirmasi Password
              </label>
              <div style={{ position: 'relative' }}>
                <CheckCircle2 size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="register-confirm-password"
                  type="password"
                  className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Ulangi password"
                  style={{ paddingLeft: '2.5rem' }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <div className="invalid-feedback">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.confirmPassword}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }} />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Daftar</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
            Sudah memiliki akun?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

