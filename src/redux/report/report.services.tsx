/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: report API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const reportServices = {
  http: apiClient,
  list: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/reports', { params });
    return data.rows || data.items || [];
  },
  getOne: async (_id?: string | number) => null,
  save: async (_payload?: any) => ({ success: true }),
  remove: async (_id?: string | number) => ({ success: true }),
  fetch: async (params: any = {}) => {
    const { data } = await apiClient.get('/panel/reports', { params });
    return data;
  },
};
