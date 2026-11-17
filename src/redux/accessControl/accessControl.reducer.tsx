/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: accessControl redux reducer
 * Edit Date: 2026-11-12
 */

import { AccessControlActionTypes, AccessControlState } from './accessControl.types';

const initialState: AccessControlState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function accessControlReducer(state = initialState, action: any): AccessControlState {
  switch (action.type) {
    case AccessControlActionTypes.FETCH_LIST_REQUEST:
    case AccessControlActionTypes.FETCH_ONE_REQUEST:
    case AccessControlActionTypes.SAVE_REQUEST:
    case AccessControlActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case AccessControlActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case AccessControlActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case AccessControlActionTypes.SAVE_SUCCESS:
    case AccessControlActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case AccessControlActionTypes.FETCH_LIST_FAILURE:
    case AccessControlActionTypes.FETCH_ONE_FAILURE:
    case AccessControlActionTypes.SAVE_FAILURE:
    case AccessControlActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case AccessControlActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
