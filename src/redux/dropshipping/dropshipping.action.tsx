/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dropshipping redux actions
 * Edit Date: 2026-11-12
 */

import { DropshippingActionTypes } from './dropshipping.types';

export const fetchDropshippingListRequest = (params?: any) => ({ type: DropshippingActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchDropshippingListSuccess = (payload: any[]) => ({ type: DropshippingActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchDropshippingListFailure = (payload: string) => ({ type: DropshippingActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchDropshippingOneRequest = (id: string | number) => ({ type: DropshippingActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchDropshippingOneSuccess = (payload: any) => ({ type: DropshippingActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchDropshippingOneFailure = (payload: string) => ({ type: DropshippingActionTypes.FETCH_ONE_FAILURE, payload });

export const saveDropshippingRequest = (payload: any) => ({ type: DropshippingActionTypes.SAVE_REQUEST, payload });
export const saveDropshippingSuccess = (payload: any) => ({ type: DropshippingActionTypes.SAVE_SUCCESS, payload });
export const saveDropshippingFailure = (payload: string) => ({ type: DropshippingActionTypes.SAVE_FAILURE, payload });

export const deleteDropshippingRequest = (id: string | number) => ({ type: DropshippingActionTypes.DELETE_REQUEST, payload: id });
export const deleteDropshippingSuccess = (payload: any) => ({ type: DropshippingActionTypes.DELETE_SUCCESS, payload });
export const deleteDropshippingFailure = (payload: string) => ({ type: DropshippingActionTypes.DELETE_FAILURE, payload });

export const resetDropshippingResponse = () => ({ type: DropshippingActionTypes.RESET_RESPONSE });
