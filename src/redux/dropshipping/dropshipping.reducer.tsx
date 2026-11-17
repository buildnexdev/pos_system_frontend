/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dropshipping redux reducer
 * Edit Date: 2026-11-12
 */

import { DropshippingActionTypes, DropshippingState } from './dropshipping.types';

const initialState: DropshippingState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function dropshippingReducer(state = initialState, action: any): DropshippingState {
  switch (action.type) {
    case DropshippingActionTypes.FETCH_LIST_REQUEST:
    case DropshippingActionTypes.FETCH_ONE_REQUEST:
    case DropshippingActionTypes.SAVE_REQUEST:
    case DropshippingActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case DropshippingActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case DropshippingActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case DropshippingActionTypes.SAVE_SUCCESS:
    case DropshippingActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case DropshippingActionTypes.FETCH_LIST_FAILURE:
    case DropshippingActionTypes.FETCH_ONE_FAILURE:
    case DropshippingActionTypes.SAVE_FAILURE:
    case DropshippingActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case DropshippingActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
