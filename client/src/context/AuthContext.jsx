import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, apiErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fleetnova_token');
    const storedUser = localStorage.getItem('fleetnova_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('fleetnova_token');
        localStorage.removeItem('fleetnova_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem('fleetnova_token', data.token);
      localStorage.setItem('fleetnova_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: apiErrorMessage(error, 'Invalid email or password') };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fleetnova_token');
    localStorage.removeItem('fleetnova_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
