/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: catalog redux reducer
 * Edit Date: 2026-11-12
 */

import { CatalogActionTypes, CatalogState } from './catalog.types';

const initialState: CatalogState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function catalogReducer(state = initialState, action: any): CatalogState {
  switch (action.type) {
    case CatalogActionTypes.FETCH_LIST_REQUEST:
    case CatalogActionTypes.FETCH_ONE_REQUEST:
    case CatalogActionTypes.SAVE_REQUEST:
    case CatalogActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case CatalogActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case CatalogActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case CatalogActionTypes.SAVE_SUCCESS:
    case CatalogActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case CatalogActionTypes.FETCH_LIST_FAILURE:
    case CatalogActionTypes.FETCH_ONE_FAILURE:
    case CatalogActionTypes.SAVE_FAILURE:
    case CatalogActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CatalogActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
