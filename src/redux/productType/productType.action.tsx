/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: productType redux actions
 * Edit Date: 2026-11-12
 */

import { ProductTypeActionTypes } from './productType.types';

export const fetchProductTypeListRequest = (params?: any) => ({ type: ProductTypeActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchProductTypeListSuccess = (payload: any[]) => ({ type: ProductTypeActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchProductTypeListFailure = (payload: string) => ({ type: ProductTypeActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchProductTypeOneRequest = (id: string | number) => ({ type: ProductTypeActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchProductTypeOneSuccess = (payload: any) => ({ type: ProductTypeActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchProductTypeOneFailure = (payload: string) => ({ type: ProductTypeActionTypes.FETCH_ONE_FAILURE, payload });

export const saveProductTypeRequest = (payload: any) => ({ type: ProductTypeActionTypes.SAVE_REQUEST, payload });
export const saveProductTypeSuccess = (payload: any) => ({ type: ProductTypeActionTypes.SAVE_SUCCESS, payload });
export const saveProductTypeFailure = (payload: string) => ({ type: ProductTypeActionTypes.SAVE_FAILURE, payload });

export const deleteProductTypeRequest = (id: string | number) => ({ type: ProductTypeActionTypes.DELETE_REQUEST, payload: id });
export const deleteProductTypeSuccess = (payload: any) => ({ type: ProductTypeActionTypes.DELETE_SUCCESS, payload });
export const deleteProductTypeFailure = (payload: string) => ({ type: ProductTypeActionTypes.DELETE_FAILURE, payload });

export const resetProductTypeResponse = () => ({ type: ProductTypeActionTypes.RESET_RESPONSE });
