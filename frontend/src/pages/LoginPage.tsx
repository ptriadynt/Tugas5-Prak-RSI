import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { UtensilsCrossed, LogIn, AlertCircle, CheckCircle, Info, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Messages from navigation state
  const from = (location.state as any)?.from?.pathname || '/stalls';
  const successMessage = (location.state as any)?.successMessage;
  const warningMessage = (location.state as any)?.warningMessage;
  const infoMessage = (location.state as any)?.infoMessage;

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!password) {
      errors.password = 'Password wajib diisi';
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
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
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
            Temukan warung favoritmu
          </h3>

          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.975rem', lineHeight: 1.6, maxWidth: '340px' }}>
            Jelajahi beragam kuliner kampus, temukan rekomendasi makanan lezat, dan kelola warung Anda dengan mudah.
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
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
              Selamat Datang
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem' }}>
              Masukkan email dan password untuk masuk ke akun Anda.
            </p>
          </div>

          {/* Flash Messages */}
          {successMessage && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {warningMessage && (
            <div className="alert alert-warning">
              <AlertCircle size={18} />
              <span>{warningMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="alert alert-info">
              <Info size={18} />
              <span>{infoMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="login-email"
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

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  id="login-password"
                  type="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  placeholder="Masukkan password"
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

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }} />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk</span>
                </>
              )}
            </button>

            {/* Akun Uji Cepat */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #EEF2F6' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                Akun Uji Cepat:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    setEmail('admin@kantin.test');
                    setPassword('admin123');
                    setFieldErrors({});
                    setServerError(null);
                  }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    setEmail('tini@kantin.test');
                    setPassword('rahasia123');
                    setFieldErrors({});
                    setServerError(null);
                  }}
                >
                  Owner (Bu Tini)
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    setEmail('bagas@student.test');
                    setPassword('rahasia123');
                    setFieldErrors({});
                    setServerError(null);
                  }}
                >
                  Customer (Bagas)
                </button>
              </div>
            </div>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.925rem', color: 'var(--color-text-muted)' }}>
            Belum punya akun?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

