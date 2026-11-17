/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: paymentGateway redux reducer
 * Edit Date: 2026-11-12
 */

import { PaymentGatewayActionTypes, PaymentGatewayState } from './paymentGateway.types';

const initialState: PaymentGatewayState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function paymentGatewayReducer(state = initialState, action: any): PaymentGatewayState {
  switch (action.type) {
    case PaymentGatewayActionTypes.FETCH_LIST_REQUEST:
    case PaymentGatewayActionTypes.FETCH_ONE_REQUEST:
    case PaymentGatewayActionTypes.SAVE_REQUEST:
    case PaymentGatewayActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case PaymentGatewayActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case PaymentGatewayActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case PaymentGatewayActionTypes.SAVE_SUCCESS:
    case PaymentGatewayActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case PaymentGatewayActionTypes.FETCH_LIST_FAILURE:
    case PaymentGatewayActionTypes.FETCH_ONE_FAILURE:
    case PaymentGatewayActionTypes.SAVE_FAILURE:
    case PaymentGatewayActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case PaymentGatewayActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
