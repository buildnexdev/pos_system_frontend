/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: company redux reducer
 * Edit Date: 2026-11-14
 */

import { CompanyActionTypes, CompanyState } from './company.types';

const initialState: CompanyState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function companyReducer(state = initialState, action: any): CompanyState {
  switch (action.type) {
    case CompanyActionTypes.FETCH_LIST_REQUEST:
    case CompanyActionTypes.FETCH_ONE_REQUEST:
    case CompanyActionTypes.SAVE_REQUEST:
    case CompanyActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case CompanyActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case CompanyActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case CompanyActionTypes.SAVE_SUCCESS:
    case CompanyActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case CompanyActionTypes.FETCH_LIST_FAILURE:
    case CompanyActionTypes.FETCH_ONE_FAILURE:
    case CompanyActionTypes.SAVE_FAILURE:
    case CompanyActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CompanyActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
