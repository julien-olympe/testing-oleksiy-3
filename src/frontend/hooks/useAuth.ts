import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

const USER_STORAGE_KEY = 'wind_plant_user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    // Restore user from localStorage on initial mount
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session is still valid if we have a stored user
    if (user) {
      api
        .getProjects()
        .then(() => {
          // Session is valid, keep user
          setLoading(false);
        })
        .catch(() => {
          // Session invalid, clear user
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
          setLoading(false);
        });
    } else {
      // No stored user, set loading to false immediately
      // We'll verify session on first protected route access
      setLoading(false);
    }
  }, []); // Only run on mount

  const login = async (usernameOrEmail: string, password: string) => {
    const userData = await api.login(usernameOrEmail, password);
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const userData = await api.register(username, email, password, passwordConfirmation);
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    return userData;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
