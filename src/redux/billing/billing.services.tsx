/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: billing API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const billingServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/billings', { params });
    return data.items || data.billings || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/billings/${id}`);
    return data;
  },
  save: async (payload: any) => {
    const { data } = await apiClient.post('/panel/pos/checkout', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/billings/${id}`);
    return data;
  },
  lookup: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/pos/lookup', { params });
    return data;
  },
  customers: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/pos/customers', { params });
    return data.customers || data.items || [];
  },
};
