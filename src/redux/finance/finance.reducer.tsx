/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: finance redux reducer
 * Edit Date: 2026-11-12
 */

import { FinanceActionTypes, FinanceState } from './finance.types';

const initialState: FinanceState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function financeReducer(state = initialState, action: any): FinanceState {
  switch (action.type) {
    case FinanceActionTypes.FETCH_LIST_REQUEST:
    case FinanceActionTypes.FETCH_ONE_REQUEST:
    case FinanceActionTypes.SAVE_REQUEST:
    case FinanceActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case FinanceActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case FinanceActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case FinanceActionTypes.SAVE_SUCCESS:
    case FinanceActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case FinanceActionTypes.FETCH_LIST_FAILURE:
    case FinanceActionTypes.FETCH_ONE_FAILURE:
    case FinanceActionTypes.SAVE_FAILURE:
    case FinanceActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FinanceActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
