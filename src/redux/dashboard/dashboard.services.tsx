/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dashboard API services
 * Edit Date: 2026-11-12
 */

import apiClient from '../../services/apiClient';

export const dashboardServices = {
  http: apiClient,
  list: async (_params: any = {}) => {
    const { data } = await apiClient.get('/panel/dashboard');
    return data;
  },
  getOne: async (_id?: string | number) => null,
  save: async (_payload?: any) => ({ success: true }),
  remove: async (_id?: string | number) => ({ success: true }),
};
