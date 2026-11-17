/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: productType redux reducer
 * Edit Date: 2026-11-12
 */

import { ProductTypeActionTypes, ProductTypeState } from './productType.types';

const initialState: ProductTypeState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function productTypeReducer(state = initialState, action: any): ProductTypeState {
  switch (action.type) {
    case ProductTypeActionTypes.FETCH_LIST_REQUEST:
    case ProductTypeActionTypes.FETCH_ONE_REQUEST:
    case ProductTypeActionTypes.SAVE_REQUEST:
    case ProductTypeActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case ProductTypeActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case ProductTypeActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case ProductTypeActionTypes.SAVE_SUCCESS:
    case ProductTypeActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case ProductTypeActionTypes.FETCH_LIST_FAILURE:
    case ProductTypeActionTypes.FETCH_ONE_FAILURE:
    case ProductTypeActionTypes.SAVE_FAILURE:
    case ProductTypeActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ProductTypeActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
