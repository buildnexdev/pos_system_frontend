/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: productType API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const productTypeServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/product-types', { params });
    return data.items || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/product-types/${id}`);
    return data.item || data.productType || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/product-types/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/product-types', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/product-types/${id}`);
    return data;
  },
};
