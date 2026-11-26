import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, UserRole } from '../types/auth';
import { getMeApi, loginApi, registerApi, logoutApi } from '../api/auth';
import type { Stall } from '../types/stall';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  canCreateStall: () => boolean;
  canEditStall: (stall?: Stall | null) => boolean;
  canDeleteStall: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inisialisasi: pulihkan sesi jika ada token di localStorage
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getMeApi();
        setUser(userData);
      } catch (error) {
        console.warn('Gagal memulihkan sesi pengguna:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();

    // Event listener jika token kedaluwarsa dari interceptor axios
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      setUser(null);
      setToken(null);
      if (customEvent.detail?.message) {
        console.info(customEvent.detail.message);
      }
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await loginApi({ email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const createdUser = await registerApi({ name, email, password });
    return createdUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.warn('Logout API failed (best-effort):', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canCreateStall = (): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'owner';
  };

  const canEditStall = (stall?: Stall | null): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'owner' && stall && stall.ownerId === user.id) return true;
    return false;
  };

  const canDeleteStall = (): boolean => {
    if (!user) return false;
    return user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
        canCreateStall,
        canEditStall,
        canDeleteStall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

