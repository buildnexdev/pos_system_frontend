/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: orderPanel redux actions
 * Edit Date: 2026-11-12
 */

import { OrderPanelActionTypes } from './orderPanel.types';

export const fetchOrderPanelListRequest = (params?: any) => ({ type: OrderPanelActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchOrderPanelListSuccess = (payload: any[]) => ({ type: OrderPanelActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchOrderPanelListFailure = (payload: string) => ({ type: OrderPanelActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchOrderPanelOneRequest = (id: string | number) => ({ type: OrderPanelActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchOrderPanelOneSuccess = (payload: any) => ({ type: OrderPanelActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchOrderPanelOneFailure = (payload: string) => ({ type: OrderPanelActionTypes.FETCH_ONE_FAILURE, payload });

export const saveOrderPanelRequest = (payload: any) => ({ type: OrderPanelActionTypes.SAVE_REQUEST, payload });
export const saveOrderPanelSuccess = (payload: any) => ({ type: OrderPanelActionTypes.SAVE_SUCCESS, payload });
export const saveOrderPanelFailure = (payload: string) => ({ type: OrderPanelActionTypes.SAVE_FAILURE, payload });

export const deleteOrderPanelRequest = (id: string | number) => ({ type: OrderPanelActionTypes.DELETE_REQUEST, payload: id });
export const deleteOrderPanelSuccess = (payload: any) => ({ type: OrderPanelActionTypes.DELETE_SUCCESS, payload });
export const deleteOrderPanelFailure = (payload: string) => ({ type: OrderPanelActionTypes.DELETE_FAILURE, payload });

export const resetOrderPanelResponse = () => ({ type: OrderPanelActionTypes.RESET_RESPONSE });
