import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getToken } from '../services/api';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const { success, error } = useNotification();

  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.auth.me();
        setUser(data.user);
      } catch (err) {
        console.error('Failed to load user session:', err);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`, 'Logged In');
      return res.user;
    } catch (err) {
      error(err.message, 'Login Failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.auth.register(userData);
      setToken(res.token);
      setUser(res.user);
      success('Account created successfully! Welcome to FitLife AI.', 'Registered');
      return res.user;
    } catch (err) {
      error(err.message, 'Registration Failed');
      throw err;
    }
  };

  const loginWithGoogle = async (mockData) => {
    try {
      const res = await api.auth.google(mockData || {
        email: 'alex@fitlife.ai',
        name: 'Alex Morgan',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setToken(res.token);
      setUser(res.user);
      success(`Signed in with Google as ${res.user.name}`, 'Google Sign-In');
      return res.user;
    } catch (err) {
      error(err.message, 'Google Sign-In Failed');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    success('You have been logged out securely.', 'Logged Out');
  };

  const updateProfile = async (fields) => {
    try {
      const res = await api.auth.updateProfile(fields);
      setUser(res.user);
      success('Profile updated successfully!', 'Saved');
      return res.user;
    } catch (err) {
      error(err.message, 'Update Failed');
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      refreshUser,
      showAuthModal,
      setShowAuthModal,
      showOnboardingModal,
      setShowOnboardingModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
