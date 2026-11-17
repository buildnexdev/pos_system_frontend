/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: supplier redux actions
 * Edit Date: 2026-11-12
 */

import { SupplierActionTypes } from './supplier.types';

export const fetchSupplierListRequest = (params?: any) => ({ type: SupplierActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchSupplierListSuccess = (payload: any[]) => ({ type: SupplierActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchSupplierListFailure = (payload: string) => ({ type: SupplierActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchSupplierOneRequest = (id: string | number) => ({ type: SupplierActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchSupplierOneSuccess = (payload: any) => ({ type: SupplierActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchSupplierOneFailure = (payload: string) => ({ type: SupplierActionTypes.FETCH_ONE_FAILURE, payload });

export const saveSupplierRequest = (payload: any) => ({ type: SupplierActionTypes.SAVE_REQUEST, payload });
export const saveSupplierSuccess = (payload: any) => ({ type: SupplierActionTypes.SAVE_SUCCESS, payload });
export const saveSupplierFailure = (payload: string) => ({ type: SupplierActionTypes.SAVE_FAILURE, payload });

export const deleteSupplierRequest = (id: string | number) => ({ type: SupplierActionTypes.DELETE_REQUEST, payload: id });
export const deleteSupplierSuccess = (payload: any) => ({ type: SupplierActionTypes.DELETE_SUCCESS, payload });
export const deleteSupplierFailure = (payload: string) => ({ type: SupplierActionTypes.DELETE_FAILURE, payload });

export const resetSupplierResponse = () => ({ type: SupplierActionTypes.RESET_RESPONSE });
