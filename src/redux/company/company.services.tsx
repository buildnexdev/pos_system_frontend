/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: company API services
 * Edit Date: 2026-11-14
 */

import apiClient from '../../services/apiClient';

export const companyServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/companies', { params });
    return data.items || [];
  },
  getOne: async (id: string | number) => {
    const { data } = await apiClient.get(`/panel/companies/${id}`);
    return data.item || data;
  },
  save: async (payload: any) => {
    const id = payload?.id;
    if (id) {
      const { data } = await apiClient.put(`/panel/companies/${id}`, payload);
      return data;
    }
    const { data } = await apiClient.post('/panel/companies', payload);
    return data;
  },
  remove: async (id: string | number) => {
    const { data } = await apiClient.delete(`/panel/companies/${id}`);
    return data;
  },
};
