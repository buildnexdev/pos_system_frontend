/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer orders redux actions
 * Edit Date: 2026-11-12
 */
import { OrdersActionTypes } from './orders.types';

export const placeOrderRequest = (payload: any) => ({ type: OrdersActionTypes.PLACE_ORDER_REQUEST, payload });
export const placeOrderSuccess = (payload: any) => ({ type: OrdersActionTypes.PLACE_ORDER_SUCCESS, payload });
export const placeOrderFailure = (payload: string) => ({ type: OrdersActionTypes.PLACE_ORDER_FAILURE, payload });

export const fetchOrdersRequest = () => ({ type: OrdersActionTypes.FETCH_ORDERS_REQUEST });
export const fetchOrdersSuccess = (payload: any[]) => ({ type: OrdersActionTypes.FETCH_ORDERS_SUCCESS, payload });
export const fetchOrdersFailure = (payload: string) => ({ type: OrdersActionTypes.FETCH_ORDERS_FAILURE, payload });

export const fetchOrderRequest = (id: string | number) => ({ type: OrdersActionTypes.FETCH_ORDER_REQUEST, payload: id });
export const fetchOrderSuccess = (payload: any) => ({ type: OrdersActionTypes.FETCH_ORDER_SUCCESS, payload });
export const fetchOrderFailure = (payload: string) => ({ type: OrdersActionTypes.FETCH_ORDER_FAILURE, payload });

export const cancelOrderRequest = (id: string | number) => ({ type: OrdersActionTypes.CANCEL_ORDER_REQUEST, payload: id });
export const cancelOrderSuccess = (payload: any) => ({ type: OrdersActionTypes.CANCEL_ORDER_SUCCESS, payload });
export const cancelOrderFailure = (payload: string) => ({ type: OrdersActionTypes.CANCEL_ORDER_FAILURE, payload });
