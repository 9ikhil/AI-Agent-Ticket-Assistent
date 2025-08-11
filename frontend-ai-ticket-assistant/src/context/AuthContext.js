import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      toast.success(`Welcome back, ${user.userName}!`);
      return { success: true };
    } catch (error) {
      console.log("this is error", error);  
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      toast.success(`Welcome aboard, ${user.userName}!`);
      return { success: true };
    } catch (error) {
      console.log("this is error", error);
      const errorMessage = error.response?.data?.error || 'Signup failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};