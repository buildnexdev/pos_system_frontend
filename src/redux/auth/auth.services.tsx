import apiClient from '../../services/apiClient';
import { getToken, setToken, setUser, clearAuth } from '../../common/jwt';

const RIGHTS_KEY = 'auth_rights';

export const authService = {
  http: apiClient,
  login: async (login: string, password: string) => {
    const response = await apiClient.post('/auth/login', { login, email: login, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (login: string) => {
    const response = await apiClient.post('/auth/forgot-password', { login, email: login });
    return response.data;
  },

  resetPasswordWithOtp: async (payload: {
    login: string;
    otp: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },

  companyRequest: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post('/auth/company-request', payload);
    return response.data;
  },

  logout: async () => {
    clearAuth();
    localStorage.removeItem(RIGHTS_KEY);
  },

  loadUser: async () => {
    const token = getToken();
    if (!token) throw new Error('No token found');
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (payload: any) => {
    const response = await apiClient.put('/auth/profile', payload);
    return response.data;
  },

  changePassword: async (payload: {
    old_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    const response = await apiClient.post('/auth/change-password', payload);
    return response.data;
  },

  logoutRemote: async () => {
    try {
      await apiClient.post('/auth/logout', null, { skipLoading: true } as any);
    } catch {
      // ignore — local logout still proceeds
    }
  },

  storeAuthData: (user: any, token: string, rights: any[] = []) => {
    setToken(token);
    setUser(user);
    localStorage.setItem(RIGHTS_KEY, JSON.stringify(rights || []));
  },

  getStoredRights: () => {
    try {
      return JSON.parse(localStorage.getItem(RIGHTS_KEY) || '[]');
    } catch {
      return [];
    }
  },

  clearAuthData: () => {
    clearAuth();
    localStorage.removeItem(RIGHTS_KEY);
  },
};
