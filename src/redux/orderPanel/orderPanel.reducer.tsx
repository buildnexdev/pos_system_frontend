/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: orderPanel redux reducer
 * Edit Date: 2026-11-12
 */

import { OrderPanelActionTypes, OrderPanelState } from './orderPanel.types';

const initialState: OrderPanelState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function orderPanelReducer(state = initialState, action: any): OrderPanelState {
  switch (action.type) {
    case OrderPanelActionTypes.FETCH_LIST_REQUEST:
    case OrderPanelActionTypes.FETCH_ONE_REQUEST:
    case OrderPanelActionTypes.SAVE_REQUEST:
    case OrderPanelActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case OrderPanelActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case OrderPanelActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case OrderPanelActionTypes.SAVE_SUCCESS:
    case OrderPanelActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case OrderPanelActionTypes.FETCH_LIST_FAILURE:
    case OrderPanelActionTypes.FETCH_ONE_FAILURE:
    case OrderPanelActionTypes.SAVE_FAILURE:
    case OrderPanelActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case OrderPanelActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
