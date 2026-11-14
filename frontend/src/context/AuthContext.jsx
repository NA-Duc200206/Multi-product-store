import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadProfile = async (currentToken) => {
    try {
      if (currentToken) {
        const response = await api.auth.getProfile();
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error.message);
      // If token expired or invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      loadProfile(token);
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.auth.register(name, email, password);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => (updatedUser ? { ...prev, ...updatedUser } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
