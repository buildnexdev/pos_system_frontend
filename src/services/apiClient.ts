import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getToken, clearAuth } from '../common/jwt';
import { startGlobalLoading, stopGlobalLoading } from '../utils/globalLoading';

// Use Vite proxy (/api -> http://localhost:5000) in local dev to avoid CORS/network errors
const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

export type ApiRequestConfig = InternalAxiosRequestConfig & {
  /** Skip global overlay spinner for this request */
  skipLoading?: boolean;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function shouldTrackLoading(config?: ApiRequestConfig) {
  if (!config) return true;
  if (config.skipLoading) return false;
  const header = config.headers?.['X-Skip-Loading'] ?? config.headers?.['x-skip-loading'];
  return !(header === true || header === '1' || header === 'true');
}

apiClient.interceptors.request.use((config: ApiRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (shouldTrackLoading(config)) {
    (config as ApiRequestConfig & { __loadingTracked?: boolean }).__loadingTracked = true;
    startGlobalLoading();
  }
  return config;
});

let authRedirectScheduled = false;

apiClient.interceptors.response.use(
  (response) => {
    const cfg = response.config as ApiRequestConfig & { __loadingTracked?: boolean };
    if (cfg.__loadingTracked) stopGlobalLoading();
    return response;
  },
  (error) => {
    const cfg = (error?.config || {}) as ApiRequestConfig & { __loadingTracked?: boolean };
    if (cfg.__loadingTracked) stopGlobalLoading();
    if (error?.response?.status === 401) {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;
      clearAuth();
      if (!authRedirectScheduled && typeof window !== 'undefined') {
        authRedirectScheduled = true;
        const reason =
          code === 'SESSION_REPLACED'
            ? 'Logged in on another device. Please login again.'
            : code === 'TOKEN_EXPIRED'
              ? 'Session expired after 24 hours. Please login again.'
              : message || 'Please login again.';
        try {
          sessionStorage.setItem('auth_kick_reason', reason);
        } catch {
          /* ignore */
        }
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        } else {
          authRedirectScheduled = false;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
