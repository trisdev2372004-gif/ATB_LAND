import { useState, useEffect, useCallback } from 'react';

function readStoredUser() {
  try {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    if (!token || !rawUser) return null;
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser);

  const syncUser = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncUser);
    window.addEventListener('auth-changed', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('auth-changed', syncUser);
    };
  }, [syncUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdminOrHost: Boolean(user && ['ADMIN', 'HOST'].includes(user.role)),
    logout,
    syncUser,
  };
}