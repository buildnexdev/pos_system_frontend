/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: role redux reducer
 * Edit Date: 2026-11-12
 */

import { RoleActionTypes, RoleState } from './role.types';

const initialState: RoleState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function roleReducer(state = initialState, action: any): RoleState {
  switch (action.type) {
    case RoleActionTypes.FETCH_LIST_REQUEST:
    case RoleActionTypes.FETCH_ONE_REQUEST:
    case RoleActionTypes.SAVE_REQUEST:
    case RoleActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case RoleActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case RoleActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case RoleActionTypes.SAVE_SUCCESS:
    case RoleActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case RoleActionTypes.FETCH_LIST_FAILURE:
    case RoleActionTypes.FETCH_ONE_FAILURE:
    case RoleActionTypes.SAVE_FAILURE:
    case RoleActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case RoleActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
