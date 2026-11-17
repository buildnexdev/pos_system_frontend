/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: billing redux reducer
 * Edit Date: 2026-11-12
 */

import { BillingActionTypes, BillingState } from './billing.types';

const initialState: BillingState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function billingReducer(state = initialState, action: any): BillingState {
  switch (action.type) {
    case BillingActionTypes.FETCH_LIST_REQUEST:
    case BillingActionTypes.FETCH_ONE_REQUEST:
    case BillingActionTypes.SAVE_REQUEST:
    case BillingActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case BillingActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case BillingActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case BillingActionTypes.SAVE_SUCCESS:
    case BillingActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case BillingActionTypes.FETCH_LIST_FAILURE:
    case BillingActionTypes.FETCH_ONE_FAILURE:
    case BillingActionTypes.SAVE_FAILURE:
    case BillingActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case BillingActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
