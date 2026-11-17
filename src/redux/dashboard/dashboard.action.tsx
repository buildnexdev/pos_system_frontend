/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dashboard redux actions
 * Edit Date: 2026-11-12
 */

import { DashboardActionTypes } from './dashboard.types';

export const fetchDashboardListRequest = (params?: any) => ({ type: DashboardActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchDashboardListSuccess = (payload: any[]) => ({ type: DashboardActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchDashboardListFailure = (payload: string) => ({ type: DashboardActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchDashboardOneRequest = (id: string | number) => ({ type: DashboardActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchDashboardOneSuccess = (payload: any) => ({ type: DashboardActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchDashboardOneFailure = (payload: string) => ({ type: DashboardActionTypes.FETCH_ONE_FAILURE, payload });

export const saveDashboardRequest = (payload: any) => ({ type: DashboardActionTypes.SAVE_REQUEST, payload });
export const saveDashboardSuccess = (payload: any) => ({ type: DashboardActionTypes.SAVE_SUCCESS, payload });
export const saveDashboardFailure = (payload: string) => ({ type: DashboardActionTypes.SAVE_FAILURE, payload });

export const deleteDashboardRequest = (id: string | number) => ({ type: DashboardActionTypes.DELETE_REQUEST, payload: id });
export const deleteDashboardSuccess = (payload: any) => ({ type: DashboardActionTypes.DELETE_SUCCESS, payload });
export const deleteDashboardFailure = (payload: string) => ({ type: DashboardActionTypes.DELETE_FAILURE, payload });

export const resetDashboardResponse = () => ({ type: DashboardActionTypes.RESET_RESPONSE });
