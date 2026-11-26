import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  LogIn,
  UserPlus,
  LogOut,
  PlusCircle,
  User as UserIcon,
  Shield,
  Store,
  Heart,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { state: { infoMessage: 'Anda telah berhasil keluar dari akun.' } });
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-brand">
          <UtensilsCrossed size={26} color="#C9A24B" />
          <span>Kantin</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Beranda
          </NavLink>

          <NavLink to="/stalls" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Warung
          </NavLink>

          {/* Customer / General: Favorit */}
          <NavLink to="/favorites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Heart size={15} />
              Favorit
            </span>
          </NavLink>

          {/* Owner specific: Warung Saya */}
          {user?.role === 'owner' && (
            <NavLink to="/owner/stalls" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Store size={15} />
                Warung Saya
              </span>
            </NavLink>
          )}

          {/* Admin specific: Panel Admin */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Shield size={15} />
                Panel Admin
              </span>
            </NavLink>
          )}

          {/* Tambah Warung: Owner & Admin dapat mengisi form, Customer akan melihat layar Akses Ditolak 403 */}
          {isAuthenticated && (
            <NavLink to="/stalls/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <PlusCircle size={15} />
                Tambah Warung
              </span>
            </NavLink>
          )}
        </nav>

        <div className="nav-auth">
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Link to="/profile" className="user-profile-badge" style={{ textDecoration: 'none' }} title="Lihat Profil Saya">
                <UserIcon size={16} />
                <span style={{ fontWeight: 500 }}>{user.name}</span>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline-white btn-sm" title="Keluar dari akun">
                <LogOut size={15} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-outline-white btn-sm">
                <LogIn size={16} />
                <span>Masuk</span>
              </Link>
              <Link to="/register" className="btn btn-white btn-sm" style={{ fontWeight: 600 }}>
                <UserPlus size={16} />
                <span>Daftar</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
