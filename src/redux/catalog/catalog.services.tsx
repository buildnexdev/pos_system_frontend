/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: catalog API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const catalogServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/products', { params });
    return data.products || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/products/${id}`);
    return data.item || data.catalog || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/products/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/products', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/products/${id}`);
    return data;
  },
};
