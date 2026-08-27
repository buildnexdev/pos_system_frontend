import axios from 'axios';
import { getToken, setToken, setUser, clearAuth } from '../../common/jwt.tsx';

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  },

  logout: async () => {
    try {
      const token = getToken();
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  },

  loadUser: async () => {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Store auth data with encryption
  storeAuthData: (user: any, token: string) => {
    setToken(token);
    setUser(user);
  },

  // Clear auth data
  clearAuthData: () => {
    clearAuth();
  },
};
