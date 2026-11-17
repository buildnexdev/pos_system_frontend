/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: warehouse redux reducer
 * Edit Date: 2026-11-12
 */

import { WarehouseActionTypes, WarehouseState } from './warehouse.types';

const initialState: WarehouseState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function warehouseReducer(state = initialState, action: any): WarehouseState {
  switch (action.type) {
    case WarehouseActionTypes.FETCH_LIST_REQUEST:
    case WarehouseActionTypes.FETCH_ONE_REQUEST:
    case WarehouseActionTypes.SAVE_REQUEST:
    case WarehouseActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case WarehouseActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case WarehouseActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case WarehouseActionTypes.SAVE_SUCCESS:
    case WarehouseActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case WarehouseActionTypes.FETCH_LIST_FAILURE:
    case WarehouseActionTypes.FETCH_ONE_FAILURE:
    case WarehouseActionTypes.SAVE_FAILURE:
    case WarehouseActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case WarehouseActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
