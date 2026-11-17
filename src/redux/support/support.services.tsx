/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: support API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const supportServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/support/tickets', { params });
    return data.tickets || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/support/tickets/${id}`);
    return data;
  },
  save: async (payload: any) => {
    if (payload instanceof FormData) {
      const { data } = await apiClient.post('/panel/support/tickets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    if (payload.reply) {
      const { id, ...rest } = payload;
      const { data } = await apiClient.post(`/panel/support/tickets/${id}/reply`, rest);
      return data;
    }
    const { data } = await apiClient.post('/panel/support/tickets', payload);
    return data;
  },
  remove: async (_id?: string | number) => ({ success: true }),
  articles: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/support/articles', { params });
    return data.articles || [];
  },
  categories: async () => {
    const { data } = await apiClient.get('/panel/support/categories');
    return data.categories || [];
  },
  settings: async () => {
    const { data } = await apiClient.get('/panel/support/settings');
    return data.settings;
  },
  saveSettings: async (payload: any) => {
    const { data } = await apiClient.put('/panel/support/settings', payload);
    return data.settings;
  },
};
