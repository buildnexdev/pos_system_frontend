/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: billing redux actions
 * Edit Date: 2026-11-12
 */

import { BillingActionTypes } from './billing.types';

export const fetchBillingListRequest = (params?: any) => ({ type: BillingActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchBillingListSuccess = (payload: any[]) => ({ type: BillingActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchBillingListFailure = (payload: string) => ({ type: BillingActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchBillingOneRequest = (id: string | number) => ({ type: BillingActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchBillingOneSuccess = (payload: any) => ({ type: BillingActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchBillingOneFailure = (payload: string) => ({ type: BillingActionTypes.FETCH_ONE_FAILURE, payload });

export const saveBillingRequest = (payload: any) => ({ type: BillingActionTypes.SAVE_REQUEST, payload });
export const saveBillingSuccess = (payload: any) => ({ type: BillingActionTypes.SAVE_SUCCESS, payload });
export const saveBillingFailure = (payload: string) => ({ type: BillingActionTypes.SAVE_FAILURE, payload });

export const deleteBillingRequest = (id: string | number) => ({ type: BillingActionTypes.DELETE_REQUEST, payload: id });
export const deleteBillingSuccess = (payload: any) => ({ type: BillingActionTypes.DELETE_SUCCESS, payload });
export const deleteBillingFailure = (payload: string) => ({ type: BillingActionTypes.DELETE_FAILURE, payload });

export const resetBillingResponse = () => ({ type: BillingActionTypes.RESET_RESPONSE });
