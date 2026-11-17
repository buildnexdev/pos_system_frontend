/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer panel API services
 * Edit Date: 2026-11-14
 */

import apiClient from '../../services/apiClient';

export const customerServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/customers', { params });
    return data.customers || data.items || [];
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/customers/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/customers', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/customers/${id}`);
    return data;
  },
};
