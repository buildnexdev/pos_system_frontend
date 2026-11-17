/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: orderPanel API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const orderPanelServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/orders', { params });
    return data.orders || data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/orders/${id}`);
    return data.item || data.orderPanel || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/orders/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/orders', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/orders/${id}`);
    return data;
  },
};
