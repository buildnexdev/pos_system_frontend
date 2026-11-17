/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dashboard redux reducer
 * Edit Date: 2026-11-12
 */

import { DashboardActionTypes, DashboardState } from './dashboard.types';

const initialState: DashboardState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function dashboardReducer(state = initialState, action: any): DashboardState {
  switch (action.type) {
    case DashboardActionTypes.FETCH_LIST_REQUEST:
    case DashboardActionTypes.FETCH_ONE_REQUEST:
    case DashboardActionTypes.SAVE_REQUEST:
    case DashboardActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case DashboardActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case DashboardActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case DashboardActionTypes.SAVE_SUCCESS:
    case DashboardActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case DashboardActionTypes.FETCH_LIST_FAILURE:
    case DashboardActionTypes.FETCH_ONE_FAILURE:
    case DashboardActionTypes.SAVE_FAILURE:
    case DashboardActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case DashboardActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
