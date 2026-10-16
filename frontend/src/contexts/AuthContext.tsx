import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, getToken, setToken } from '../services/api';
import type { AuthUser } from '../types';

const USER_KEY = 'hms_user';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isSuper: boolean;
  hasModule: (m: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [loading, setLoading] = useState<boolean>(() => Boolean(getToken()));

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then((u) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  };

  const refreshUser = async () => {
    const u = await authApi.me();
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const isSuper = user?.role === 'super';
  const hasModule = (m: string) => isSuper || (user?.modules || []).includes(m as AuthUser['modules'][number]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isSuper, hasModule }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};