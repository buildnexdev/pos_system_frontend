/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: finance API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const financeServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/finance', { params });
    return data.items || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/finance/${id}`);
    return data.item || data.finance || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/finance/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/finance', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/finance/${id}`);
    return data;
  },
};
