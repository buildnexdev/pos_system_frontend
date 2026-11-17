/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: branches API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const branchesServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/branches', { params });
    return data.items || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/branches/${id}`);
    return data.item || data.branches || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/branches/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/branches', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/branches/${id}`);
    return data;
  },
};
