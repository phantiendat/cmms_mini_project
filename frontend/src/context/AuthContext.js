import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const token = localStorage.getItem('token');
        
        if (currentUser && token) {
          setUser(currentUser);
        } else {
          // Nếu không có user hoặc token, xóa cả hai
          AuthService.logout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await AuthService.login(username, password);
      if (userData) {
        setUser(userData);
        return userData;
      }
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Login error:', error);
      AuthService.logout();
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (username, password, name, email, role) => {
    return AuthService.register(username, password, name, email, role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
