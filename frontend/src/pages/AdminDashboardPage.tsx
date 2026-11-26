import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getUsersApi, updateUserRoleApi } from '../api/users';
import { getStallsApi, deleteStallApi } from '../api/stalls';
import { getAuditLogsApi } from '../api/audit';
import { getErrorMessage } from '../api/client';
import type { User, UserRole } from '../types/auth';
import type { Stall } from '../types/stall';
import type { AuditLog, AuditPagination } from '../types/audit';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { AuditDetailModal } from '../components/AuditDetailModal';
import {
  Users,
  Store,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  FileText,
  Eye,
  RefreshCw,
  Globe,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'stalls' | 'audit'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);

  // Stalls state
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loadingStalls, setLoadingStalls] = useState<boolean>(true);
  const [stallError, setStallError] = useState<string | null>(null);
  const [stallSearch, setStallSearch] = useState<string>('');

  // Delete stall modal
  const [selectedStallToDelete, setSelectedStallToDelete] = useState<Stall | null>(null);
  const [isDeletingStall, setIsDeletingStall] = useState<boolean>(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditPagination, setAuditPagination] = useState<AuditPagination | null>(null);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);

  // Audit filter states
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterTargetTable, setFilterTargetTable] = useState<string>('');
  const [filterTargetId, setFilterTargetId] = useState<string>('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditPageSize, setAuditPageSize] = useState<number>(20);

  // Load users
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setUserError(null);
      const data = await getUsersApi();
      setUsers(data);
    } catch (err) {
      setUserError(getErrorMessage(err));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load stalls
  const loadStalls = async () => {
    try {
      setLoadingStalls(true);
      setStallError(null);
      const res = await getStallsApi({ page: 1, limit: 100 });
      setStalls(res.stalls);
    } catch (err) {
      setStallError(getErrorMessage(err));
    } finally {
      setLoadingStalls(false);
    }
  };

  // Load audit logs
  const loadAuditLogs = async (pageToLoad = auditPage, pageSizeToLoad = auditPageSize) => {
    try {
      setLoadingAudit(true);
      setAuditError(null);

      const targetIdNum = filterTargetId.trim() ? Number(filterTargetId.trim()) : undefined;
      const userIdNum = filterUserId.trim() ? Number(filterUserId.trim()) : undefined;

      const res = await getAuditLogsApi({
        page: pageToLoad,
        pageSize: pageSizeToLoad,
        action: filterAction || undefined,
        targetTable: filterTargetTable || undefined,
        targetId: Number.isInteger(targetIdNum) && targetIdNum! > 0 ? targetIdNum : undefined,
        userId: Number.isInteger(userIdNum) && userIdNum! > 0 ? userIdNum : undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
      });

      setAuditLogs(res.items);
      setAuditPagination(res.pagination);
    } catch (err) {
      setAuditError(getErrorMessage(err));
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadStalls();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs(auditPage, auditPageSize);
    }
  }, [activeTab, auditPage, auditPageSize]);

  // Handle role change
  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      setUserActionSuccess(null);
      await updateUserRoleApi(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setUserActionSuccess(`Role pengguna #${userId} berhasil diubah menjadi ${newRole}`);
      setTimeout(() => setUserActionSuccess(null), 4000);
    } catch (err) {
      setUserError(getErrorMessage(err));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle delete stall
  const handleDeleteStall = async () => {
    if (!selectedStallToDelete) return;
    try {
      setIsDeletingStall(true);
      await deleteStallApi(selectedStallToDelete.id);
      setStalls((prev) => prev.filter((s) => s.id !== selectedStallToDelete.id));
      setSelectedStallToDelete(null);
      setUserActionSuccess(`Warung "${selectedStallToDelete.name}" berhasil dihapus.`);
      setTimeout(() => setUserActionSuccess(null), 4000);
    } catch (err) {
      setUserError(getErrorMessage(err));
    } finally {
      setIsDeletingStall(false);
    }
  };

  const handleApplyAuditFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAuditPage(1);
    loadAuditLogs(1, auditPageSize);
  };

  const handleResetAuditFilter = () => {
    setFilterAction('');
    setFilterTargetTable('');
    setFilterTargetId('');
    setFilterUserId('');
    setFilterFrom('');
    setFilterTo('');
    setAuditPage(1);
    // fetch with clean filters
    getAuditLogsApi({ page: 1, pageSize: auditPageSize }).then((res) => {
      setAuditLogs(res.items);
      setAuditPagination(res.pagination);
    });
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toString() === userSearch.trim();
      return matchRole && matchSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  // Filtered stalls
  const filteredStalls = useMemo(() => {
    return stalls.filter((s) => {
      return (
        s.name.toLowerCase().includes(stallSearch.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(stallSearch.toLowerCase())) ||
        (s.location && s.location.toLowerCase().includes(stallSearch.toLowerCase()))
      );
    });
  }, [stalls, stallSearch]);

  // Stats
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CREATE')) return 'badge-success';
    if (action.includes('UPDATE')) return 'badge-warning';
    if (action.includes('DELETE')) return 'badge-danger';
    if (action === 'LOGIN') return 'badge-primary';
    if (action === 'LOGOUT') return 'badge-secondary';
    return 'badge-outline';
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="role-badge admin" style={{ fontSize: '0.8rem' }}>
              <Shield size={14} />
              ADMINISTRATOR
            </span>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
              Panel Kendali Admin
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Kelola hak akses pengguna, otorisasi role, seluruh data warung, dan audit log mutasi sistem secara terpusat.
          </p>
        </div>

        <Link to="/stalls/new" className="btn btn-primary">
          <Plus size={18} />
          <span>Tambah Warung Baru</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>{stalls.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Warung</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#E3F2FD', color: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>{users.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Pengguna ({ownerCount} Owner)</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#EDE7F6', color: '#512DA8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {customerCount} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>({adminCount} Admin)</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Customer & Admin</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {auditPagination?.total ?? (loadingAudit ? '...' : 0)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Catatan Audit Log</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {userActionSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{userActionSuccess}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'users' ? '3px solid var(--color-primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Users size={18} />
          <span>Manajemen Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stalls')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'stalls' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'stalls' ? '3px solid var(--color-primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Store size={18} />
          <span>Manajemen Warung ({stalls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: activeTab === 'audit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'audit' ? '3px solid var(--color-primary)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FileText size={18} />
          <span>Audit Logs (Tugas 5)</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama, email, ID..."
                style={{ paddingLeft: '2.5rem' }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} color="var(--color-text-muted)" />
              <select
                className="form-control"
                style={{ width: 'auto' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>

          {loadingUsers ? (
            <LoadingState message="Memuat daftar pengguna..." />
          ) : userError ? (
            <ErrorState message={userError} onRetry={loadUsers} />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Nama Pengguna</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Role Saat Ini</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Ubah Hak Akses</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>#{u.id}</td>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>{u.name}</td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-text-muted)' }}>{u.email}</td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span className={`role-badge ${u.role}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Shield size={12} />
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <select
                            className="form-control"
                            style={{ width: 'auto', minWidth: '130px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
                            value={u.role}
                            disabled={updatingUserId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STALLS */}
      {activeTab === 'stalls' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Cari warung, kategori, lokasi..."
                style={{ paddingLeft: '2.5rem' }}
                value={stallSearch}
                onChange={(e) => setStallSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingStalls ? (
            <LoadingState message="Memuat daftar warung..." />
          ) : stallError ? (
            <ErrorState message={stallError} onRetry={loadStalls} />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Nama Warung</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Owner ID</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Kategori</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Lokasi</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Rating</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>Aksi Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStalls.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Tidak ada warung yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStalls.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>#{s.id}</td>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>{s.name}</td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-text-muted)' }}>User #{s.ownerId}</td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span className="badge-category">{s.category || 'Umum'}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-text-muted)' }}>{s.location || '-'}</td>
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: '#a07818' }}>⭐ {s.avgRating ? Number(s.avgRating).toFixed(1) : '0.0'}</td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Link to={`/stalls/${s.id}`} className="btn btn-outline-primary btn-sm" title="Lihat Detail Warung">
                              <ExternalLink size={14} />
                            </Link>
                            <Link to={`/stalls/${s.id}/edit`} className="btn btn-outline-primary btn-sm" title="Ubah Data Warung">
                              <Edit size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setSelectedStallToDelete(s)}
                              className="btn btn-outline-danger btn-sm"
                              title="Hapus Warung"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS (TUGAS 5) */}
      {activeTab === 'audit' && (
        <div>
          {/* Filter Card Form */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                <Filter size={18} />
                <span>Filter Audit Log (Target ID, User ID, Aksi, Tanggal)</span>
              </div>
              <button
                type="button"
                onClick={() => loadAuditLogs(auditPage, auditPageSize)}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                disabled={loadingAudit}
              >
                <RefreshCw size={14} className={loadingAudit ? 'spinner' : ''} />
                <span>Refresh Log</span>
              </button>
            </div>

            <form onSubmit={handleApplyAuditFilter}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Target ID</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Contoh: 1"
                    value={filterTargetId}
                    onChange={(e) => setFilterTargetId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>User ID</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Contoh: 1"
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Aksi (Action)</label>
                  <select
                    className="form-control"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                  >
                    <option value="">Semua Aksi</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="LOGOUT">LOGOUT</option>
                    <option value="CREATE_STALL">CREATE_STALL</option>
                    <option value="UPDATE_STALL">UPDATE_STALL</option>
                    <option value="DELETE_STALL">DELETE_STALL</option>
                    <option value="CREATE_MENU">CREATE_MENU</option>
                    <option value="UPDATE_MENU">UPDATE_MENU</option>
                    <option value="DELETE_MENU">DELETE_MENU</option>
                    <option value="CREATE_REVIEW">CREATE_REVIEW</option>
                    <option value="DELETE_REVIEW">DELETE_REVIEW</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Tabel Target</label>
                  <select
                    className="form-control"
                    value={filterTargetTable}
                    onChange={(e) => setFilterTargetTable(e.target.value)}
                  >
                    <option value="">Semua Tabel</option>
                    <option value="USERS">USERS</option>
                    <option value="STALLS">STALLS</option>
                    <option value="MENU_ITEMS">MENU_ITEMS</option>
                    <option value="REVIEWS">REVIEWS</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Dari Tanggal (From)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterFrom}
                    onChange={(e) => setFilterFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Sampai Tanggal (To)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterTo}
                    onChange={(e) => setFilterTo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetAuditFilter}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Filter</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={loadingAudit}
                >
                  <Filter size={14} />
                  <span>Terapkan Filter</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit Logs Table */}
          {loadingAudit ? (
            <LoadingState message="Memuat catatan log audit sistem..." />
          ) : auditError ? (
            <ErrorState message={auditError} onRetry={() => loadAuditLogs(auditPage, auditPageSize)} />
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', borderBottom: '1.5px solid var(--color-border)' }}>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>ID</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Waktu</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Pengguna (Pelaku)</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Aksi</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>Sasaran (Target)</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>IP & Agent</th>
                    <th style={{ padding: '0.9rem 1.25rem', fontWeight: 600, textAlign: 'center' }}>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Tidak ada log audit yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr
                        key={log.id}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                        onClick={() => setSelectedAuditId(log.id)}
                      >
                        <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                          #{log.id}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                            {log.userName || `User #${log.userId}`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {log.userEmail || `ID: #${log.userId}`}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span className={`badge ${getActionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.875rem' }}>
                          <strong style={{ color: '#0F172A' }}>{log.targetTable}</strong>
                          <span style={{ color: '#64748B', marginLeft: '0.3rem' }}>#{log.targetId}</span>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.8rem', color: '#64748B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Globe size={13} />
                            <code>{log.metadata?.ip_address || '-'}</code>
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}
                            onClick={() => setSelectedAuditId(log.id)}
                            title="Buka Modal Detail Log"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {auditPagination && auditPagination.totalPages > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    backgroundColor: '#FAF7F7',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                    Menampilkan baris {(auditPagination.page - 1) * auditPagination.pageSize + 1} -{' '}
                    {Math.min(auditPagination.page * auditPagination.pageSize, auditPagination.total)} dari total{' '}
                    <strong>{auditPagination.total}</strong> log audit (Halaman {auditPagination.page} / {auditPagination.totalPages})
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748B' }}>
                      <span>Ukuran:</span>
                      <select
                        className="form-control"
                        style={{ padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.85rem' }}
                        value={auditPageSize}
                        onChange={(e) => {
                          const newSize = Number(e.target.value);
                          setAuditPageSize(newSize);
                          setAuditPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={auditPagination.page <= 1 || loadingAudit}
                      onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    >
                      &larr; Sebelumnya
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={auditPagination.page >= auditPagination.totalPages || loadingAudit}
                      onClick={() => setAuditPage((p) => p + 1)}
                    >
                      Selanjutnya &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Modal for Stalls */}
      {selectedStallToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(selectedStallToDelete)}
          stallName={selectedStallToDelete.name}
          isDeleting={isDeletingStall}
          onConfirm={handleDeleteStall}
          onCancel={() => setSelectedStallToDelete(null)}
        />
      )}

      {/* Audit Detail Modal (Tugas 5) */}
      <AuditDetailModal
        auditId={selectedAuditId}
        onClose={() => setSelectedAuditId(null)}
      />
    </div>
  );
};
