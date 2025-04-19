import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  roles: string[];
  authenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Promise<Record<string, string>>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get<User>('/api/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<{ token: string; user: User }>('/api/auth/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  return { user, loading, login, logout, getAuthHeaders };
}; 