/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dashboard redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectDashboardState = (state: RootState) => state.dashboard;
export const selectDashboardItems = (state: RootState) => state.dashboard.items;
export const selectDashboardCurrent = (state: RootState) => state.dashboard.current;
export const selectDashboardLoading = (state: RootState) => state.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardLastResponse = (state: RootState) => state.dashboard.lastResponse;
