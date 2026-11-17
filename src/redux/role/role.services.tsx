/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: role API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const roleServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/roles', { params });
    return data.roles || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/roles/${id}`);
    return data.item || data.role || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/roles/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/roles', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/roles/${id}`);
    return data;
  },
};
