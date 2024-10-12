import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(null);

  const fetchCredits = useCallback(async (userId) => {
    if (!userId) {
      console.error('Attempting to fetch credits with undefined userId');
      return;
    }
    try {
      console.log('Fetching credits for user:', userId);
      const response = await api.get(`/users/${userId}/credits`);
      console.log('Credits fetched:', response.data.credits);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits('Error');
    }
  }, []);

  const checkLoggedIn = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
        if (response.data.role !== 'admin') {
          await fetchCredits(response.data._id);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        setUser(null);
        setCredits(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setCredits(null);
    }
    setLoading(false);
  }, [fetchCredits]);

  useEffect(() => {
    checkLoggedIn();
  }, [checkLoggedIn]);

  const login = async (userData) => {
    try {
      const response = await api.post('/auth/login', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      if (user.role !== 'admin') {
        await fetchCredits(user._id);
      }
      return user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setCredits(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setCredits(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, credits, setIsAuthenticated, setUser, loading, login, logout, fetchCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;