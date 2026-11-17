/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer orders API services
 * Edit Date: 2026-11-12
 */
import apiClient from '../../services/apiClient';

export const ordersServices = {
  http: apiClient,
  placeOrder: async (payload: any) => {
    const { data } = await apiClient.post('/orders', payload);
    return data;
  },
  getOrders: async () => {
    const { data } = await apiClient.get('/orders');
    return data.orders || [];
  },
  getOrder: async (id: string | number) => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },
  cancelOrder: async (id: string | number) => {
    const { data } = await apiClient.post(`/orders/${id}/cancel`);
    return data;
  },
};
