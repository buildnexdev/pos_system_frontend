/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer orders redux reducer
 * Edit Date: 2026-11-12
 */
import { OrdersActionTypes, OrdersState } from './orders.types';

const initialState: OrdersState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function ordersReducer(state = initialState, action: any): OrdersState {
  switch (action.type) {
    case OrdersActionTypes.PLACE_ORDER_REQUEST:
    case OrdersActionTypes.FETCH_ORDERS_REQUEST:
    case OrdersActionTypes.FETCH_ORDER_REQUEST:
    case OrdersActionTypes.CANCEL_ORDER_REQUEST:
      return { ...state, loading: true, error: null };
    case OrdersActionTypes.FETCH_ORDERS_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case OrdersActionTypes.FETCH_ORDER_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case OrdersActionTypes.PLACE_ORDER_SUCCESS:
    case OrdersActionTypes.CANCEL_ORDER_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case OrdersActionTypes.PLACE_ORDER_FAILURE:
    case OrdersActionTypes.FETCH_ORDERS_FAILURE:
    case OrdersActionTypes.FETCH_ORDER_FAILURE:
    case OrdersActionTypes.CANCEL_ORDER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
