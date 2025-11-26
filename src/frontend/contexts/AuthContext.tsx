import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string, passwordConfirmation: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by trying to fetch projects
    // If it succeeds, user is authenticated (we'll get user info from login/register)
    api
      .getProjects()
      .then(() => {
        // User is authenticated, but we don't have user info from this endpoint
        // We'll get it from login/register, or it's already set
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
    setLoading(false);
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
    setLoading(false);
    return userData;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
