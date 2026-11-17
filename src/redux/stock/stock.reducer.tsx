/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: stock redux reducer
 * Edit Date: 2026-11-12
 */

import { StockActionTypes, StockState } from './stock.types';

const initialState: StockState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function stockReducer(state = initialState, action: any): StockState {
  switch (action.type) {
    case StockActionTypes.FETCH_LIST_REQUEST:
    case StockActionTypes.FETCH_ONE_REQUEST:
    case StockActionTypes.SAVE_REQUEST:
    case StockActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case StockActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case StockActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case StockActionTypes.SAVE_SUCCESS:
    case StockActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case StockActionTypes.FETCH_LIST_FAILURE:
    case StockActionTypes.FETCH_ONE_FAILURE:
    case StockActionTypes.SAVE_FAILURE:
    case StockActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case StockActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
