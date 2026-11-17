/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: support redux actions
 * Edit Date: 2026-11-12
 */

import { SupportActionTypes } from './support.types';

export const fetchSupportListRequest = (params?: any) => ({ type: SupportActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchSupportListSuccess = (payload: any[]) => ({ type: SupportActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchSupportListFailure = (payload: string) => ({ type: SupportActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchSupportOneRequest = (id: string | number) => ({ type: SupportActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchSupportOneSuccess = (payload: any) => ({ type: SupportActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchSupportOneFailure = (payload: string) => ({ type: SupportActionTypes.FETCH_ONE_FAILURE, payload });

export const saveSupportRequest = (payload: any) => ({ type: SupportActionTypes.SAVE_REQUEST, payload });
export const saveSupportSuccess = (payload: any) => ({ type: SupportActionTypes.SAVE_SUCCESS, payload });
export const saveSupportFailure = (payload: string) => ({ type: SupportActionTypes.SAVE_FAILURE, payload });

export const deleteSupportRequest = (id: string | number) => ({ type: SupportActionTypes.DELETE_REQUEST, payload: id });
export const deleteSupportSuccess = (payload: any) => ({ type: SupportActionTypes.DELETE_SUCCESS, payload });
export const deleteSupportFailure = (payload: string) => ({ type: SupportActionTypes.DELETE_FAILURE, payload });

export const resetSupportResponse = () => ({ type: SupportActionTypes.RESET_RESPONSE });
