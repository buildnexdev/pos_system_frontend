/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: staff API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const staffServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/staff', { params });
    return data.staff || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/staff/${id}`);
    return data.item || data.staff || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/staff/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/staff', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/staff/${id}`);
    return data;
  },
};
