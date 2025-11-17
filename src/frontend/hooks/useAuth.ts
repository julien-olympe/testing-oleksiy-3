import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by trying to fetch projects
    // If it fails with 401, user is not authenticated
    api
      .getProjects()
      .then(() => {
        // User is authenticated, but we don't have user info from this endpoint
        // We'll get it from login/register
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const userData = await api.login(usernameOrEmail, password);
    setUser(userData);
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
    return userData;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
  };
}
