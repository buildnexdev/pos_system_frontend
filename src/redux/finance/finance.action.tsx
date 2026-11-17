/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: finance redux actions
 * Edit Date: 2026-11-12
 */

import { FinanceActionTypes } from './finance.types';

export const fetchFinanceListRequest = (params?: any) => ({ type: FinanceActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchFinanceListSuccess = (payload: any[]) => ({ type: FinanceActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchFinanceListFailure = (payload: string) => ({ type: FinanceActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchFinanceOneRequest = (id: string | number) => ({ type: FinanceActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchFinanceOneSuccess = (payload: any) => ({ type: FinanceActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchFinanceOneFailure = (payload: string) => ({ type: FinanceActionTypes.FETCH_ONE_FAILURE, payload });

export const saveFinanceRequest = (payload: any) => ({ type: FinanceActionTypes.SAVE_REQUEST, payload });
export const saveFinanceSuccess = (payload: any) => ({ type: FinanceActionTypes.SAVE_SUCCESS, payload });
export const saveFinanceFailure = (payload: string) => ({ type: FinanceActionTypes.SAVE_FAILURE, payload });

export const deleteFinanceRequest = (id: string | number) => ({ type: FinanceActionTypes.DELETE_REQUEST, payload: id });
export const deleteFinanceSuccess = (payload: any) => ({ type: FinanceActionTypes.DELETE_SUCCESS, payload });
export const deleteFinanceFailure = (payload: string) => ({ type: FinanceActionTypes.DELETE_FAILURE, payload });

export const resetFinanceResponse = () => ({ type: FinanceActionTypes.RESET_RESPONSE });
