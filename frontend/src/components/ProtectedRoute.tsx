import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';
import { LoadingState } from './LoadingState';
import { AccessDeniedCard } from './AccessDeniedCard';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <LoadingState message="Memeriksa sesi login..." count={2} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          warningMessage: 'Halaman ini memerlukan login. Silakan masuk terlebih dahulu.',
        }}
        replace
      />
    );
  }

  // Jika halaman memiliki pembatasan role tertentu dan role user tidak diizinkan
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <AccessDeniedCard
        title="Kamu tidak punya izin untuk membuka halaman ini"
        message="Akun kamu tidak memiliki wewenang role untuk mengakses atau mengubah data ini."
        redirectPath="/stalls"
        buttonText="Kembali ke Daftar Warung"
      />
    );
  }

  return children;
};
