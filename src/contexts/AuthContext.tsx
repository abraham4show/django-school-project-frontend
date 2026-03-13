import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, AuthResponse } from '@/services/authService';
import api from '@/lib/api'; // <-- import the axios instance

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse['user']>; // changed
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Set default axios header (though interceptor already does this)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authService.getCurrentUser()
        .then(user => setUser(user))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
    setUser(response.user);
    return response.user;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};