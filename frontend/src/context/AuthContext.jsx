import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await userService.getProfile();
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Fetch user profile after login
      const profileRes = await userService.getProfile();
      setUser(profileRes.data);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { access, refresh } = response.data.tokens;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(response.data.user);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      let msg = 'Registration failed. ';
      if (error.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'string') {
          msg = errors;
        } else if (typeof errors === 'object') {
          // DRF returns error messages as a dictionary/object
          // We pick the first error to show in the toast
          const field = Object.keys(errors)[0];
          const errorMsg = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
          
          if (field === 'detail' || field === 'non_field_errors') {
            msg = errorMsg;
          } else {
            // Format: "Email: This field is required."
            const fieldName = field.replace('_', ' ');
            msg = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: ${errorMsg}`;
          }
        }
      }
      toast.error(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        await authService.logout({ refresh });
      }
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
