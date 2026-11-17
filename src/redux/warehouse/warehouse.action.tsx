/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: warehouse redux actions
 * Edit Date: 2026-11-12
 */

import { WarehouseActionTypes } from './warehouse.types';

export const fetchWarehouseListRequest = (params?: any) => ({ type: WarehouseActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchWarehouseListSuccess = (payload: any[]) => ({ type: WarehouseActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchWarehouseListFailure = (payload: string) => ({ type: WarehouseActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchWarehouseOneRequest = (id: string | number) => ({ type: WarehouseActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchWarehouseOneSuccess = (payload: any) => ({ type: WarehouseActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchWarehouseOneFailure = (payload: string) => ({ type: WarehouseActionTypes.FETCH_ONE_FAILURE, payload });

export const saveWarehouseRequest = (payload: any) => ({ type: WarehouseActionTypes.SAVE_REQUEST, payload });
export const saveWarehouseSuccess = (payload: any) => ({ type: WarehouseActionTypes.SAVE_SUCCESS, payload });
export const saveWarehouseFailure = (payload: string) => ({ type: WarehouseActionTypes.SAVE_FAILURE, payload });

export const deleteWarehouseRequest = (id: string | number) => ({ type: WarehouseActionTypes.DELETE_REQUEST, payload: id });
export const deleteWarehouseSuccess = (payload: any) => ({ type: WarehouseActionTypes.DELETE_SUCCESS, payload });
export const deleteWarehouseFailure = (payload: string) => ({ type: WarehouseActionTypes.DELETE_FAILURE, payload });

export const resetWarehouseResponse = () => ({ type: WarehouseActionTypes.RESET_RESPONSE });
