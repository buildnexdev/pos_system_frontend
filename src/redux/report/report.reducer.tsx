/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: report redux reducer
 * Edit Date: 2026-11-12
 */

import { ReportActionTypes, ReportState } from './report.types';

const initialState: ReportState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function reportReducer(state = initialState, action: any): ReportState {
  switch (action.type) {
    case ReportActionTypes.FETCH_LIST_REQUEST:
    case ReportActionTypes.FETCH_ONE_REQUEST:
    case ReportActionTypes.SAVE_REQUEST:
    case ReportActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case ReportActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case ReportActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case ReportActionTypes.SAVE_SUCCESS:
    case ReportActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case ReportActionTypes.FETCH_LIST_FAILURE:
    case ReportActionTypes.FETCH_ONE_FAILURE:
    case ReportActionTypes.SAVE_FAILURE:
    case ReportActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ReportActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
