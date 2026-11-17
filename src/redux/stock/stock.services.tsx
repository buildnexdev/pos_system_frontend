/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: stock API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const stockServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/items', { params });
    return data.items || [];
  },
  getOne: async (_id?: string | number) => null,
  save: async (payload: any) => {
    const { data } = await apiClient.post('/panel/stock/move', payload);
    return data;
  },
  remove: async (_id?: string | number) => ({ success: true }),
  history: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/history', { params });
    return data;
  },
  lowAlerts: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/stock/low-alerts', { params });
    return data.items || [];
  },
  reports: async (type: string) => {
    const { data } = await apiClient.get(`/panel/stock/reports/${type}`);
    return data;
  },
};
