/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: support redux reducer
 * Edit Date: 2026-11-12
 */

import { SupportActionTypes, SupportState } from './support.types';

const initialState: SupportState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function supportReducer(state = initialState, action: any): SupportState {
  switch (action.type) {
    case SupportActionTypes.FETCH_LIST_REQUEST:
    case SupportActionTypes.FETCH_ONE_REQUEST:
    case SupportActionTypes.SAVE_REQUEST:
    case SupportActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case SupportActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case SupportActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case SupportActionTypes.SAVE_SUCCESS:
    case SupportActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case SupportActionTypes.FETCH_LIST_FAILURE:
    case SupportActionTypes.FETCH_ONE_FAILURE:
    case SupportActionTypes.SAVE_FAILURE:
    case SupportActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SupportActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
