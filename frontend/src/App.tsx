import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { StallListPage } from './pages/StallListPage';
import { StallDetailPage } from './pages/StallDetailPage';
import { StallFormPage } from './pages/StallFormPage';
import { StallMenusPage } from './pages/StallMenusPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OwnerStallsPage } from './pages/OwnerStallsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

import './App.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/stalls" element={<StallListPage />} />
              <Route path="/stalls/:id" element={<StallDetailPage />} />
              <Route path="/stalls/:id/menus" element={<StallMenusPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes (General Authenticated) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes (Admin Exclusive) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes (Owner & Admin: Customer dilarang menambah warung) */}
              <Route
                path="/owner/stalls"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <OwnerStallsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stalls/new"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <StallFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stalls/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <StallFormPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
