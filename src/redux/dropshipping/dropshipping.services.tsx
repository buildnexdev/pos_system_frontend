/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dropshipping API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const dropshippingServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/dropshipping', { params });
    return data.items || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/dropshipping/${id}`);
    return data.item || data.dropshipping || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/dropshipping/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/dropshipping', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/dropshipping/${id}`);
    return data;
  },
};
