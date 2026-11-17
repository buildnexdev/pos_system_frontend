/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: supplier redux reducer
 * Edit Date: 2026-11-12
 */

import { SupplierActionTypes, SupplierState } from './supplier.types';

const initialState: SupplierState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function supplierReducer(state = initialState, action: any): SupplierState {
  switch (action.type) {
    case SupplierActionTypes.FETCH_LIST_REQUEST:
    case SupplierActionTypes.FETCH_ONE_REQUEST:
    case SupplierActionTypes.SAVE_REQUEST:
    case SupplierActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case SupplierActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case SupplierActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case SupplierActionTypes.SAVE_SUCCESS:
    case SupplierActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case SupplierActionTypes.FETCH_LIST_FAILURE:
    case SupplierActionTypes.FETCH_ONE_FAILURE:
    case SupplierActionTypes.SAVE_FAILURE:
    case SupplierActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SupplierActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
