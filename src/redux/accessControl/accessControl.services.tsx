/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: accessControl API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const accessControlServices = {
  http: apiClient,
  list: async (_params: any = {}) => {
    const { data } = await apiClient.get('/panel/staff-options');
    return data.staff || [];
  },
  getOne: async (userId: string | number) => {
    const { data } = await apiClient.get(`/panel/rights/${userId}`);
    return data;
  },
  save: async (payload: any) => {
    const { userId, rights } = payload;
    const { data } = await apiClient.put(`/panel/rights/${userId}`, { rights });
    return data;
  },
  remove: async (_id?: string | number) => ({ success: true }),
};
