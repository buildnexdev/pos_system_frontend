/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: staff redux reducer
 * Edit Date: 2026-11-12
 */

import { StaffActionTypes, StaffState } from './staff.types';

const initialState: StaffState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function staffReducer(state = initialState, action: any): StaffState {
  switch (action.type) {
    case StaffActionTypes.FETCH_LIST_REQUEST:
    case StaffActionTypes.FETCH_ONE_REQUEST:
    case StaffActionTypes.SAVE_REQUEST:
    case StaffActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case StaffActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case StaffActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case StaffActionTypes.SAVE_SUCCESS:
    case StaffActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case StaffActionTypes.FETCH_LIST_FAILURE:
    case StaffActionTypes.FETCH_ONE_FAILURE:
    case StaffActionTypes.SAVE_FAILURE:
    case StaffActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case StaffActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
