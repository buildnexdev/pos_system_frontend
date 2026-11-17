/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: stock redux actions
 * Edit Date: 2026-11-12
 */

import { StockActionTypes } from './stock.types';

export const fetchStockListRequest = (params?: any) => ({ type: StockActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchStockListSuccess = (payload: any[]) => ({ type: StockActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchStockListFailure = (payload: string) => ({ type: StockActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchStockOneRequest = (id: string | number) => ({ type: StockActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchStockOneSuccess = (payload: any) => ({ type: StockActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchStockOneFailure = (payload: string) => ({ type: StockActionTypes.FETCH_ONE_FAILURE, payload });

export const saveStockRequest = (payload: any) => ({ type: StockActionTypes.SAVE_REQUEST, payload });
export const saveStockSuccess = (payload: any) => ({ type: StockActionTypes.SAVE_SUCCESS, payload });
export const saveStockFailure = (payload: string) => ({ type: StockActionTypes.SAVE_FAILURE, payload });

export const deleteStockRequest = (id: string | number) => ({ type: StockActionTypes.DELETE_REQUEST, payload: id });
export const deleteStockSuccess = (payload: any) => ({ type: StockActionTypes.DELETE_SUCCESS, payload });
export const deleteStockFailure = (payload: string) => ({ type: StockActionTypes.DELETE_FAILURE, payload });

export const resetStockResponse = () => ({ type: StockActionTypes.RESET_RESPONSE });
