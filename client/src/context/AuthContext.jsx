import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (data) => {
    const res = await api.post('/auth/login', data);
    setUser(res.data.user);
    toast.success('Logged in');
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    setUser(res.data.user);
    toast.success('Registered and logged in');
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/me', data);
    setUser(res.data.user);
    toast.success('Profile updated');
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
