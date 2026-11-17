/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: branches redux reducer
 * Edit Date: 2026-11-12
 */

import { BranchesActionTypes, BranchesState } from './branches.types';

const initialState: BranchesState = {
  items: [],
  current: null,
  loading: false,
  error: null,
  lastResponse: null,
};

export default function branchesReducer(state = initialState, action: any): BranchesState {
  switch (action.type) {
    case BranchesActionTypes.FETCH_LIST_REQUEST:
    case BranchesActionTypes.FETCH_ONE_REQUEST:
    case BranchesActionTypes.SAVE_REQUEST:
    case BranchesActionTypes.DELETE_REQUEST:
      return { ...state, loading: true, error: null };
    case BranchesActionTypes.FETCH_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload || [] };
    case BranchesActionTypes.FETCH_ONE_SUCCESS:
      return { ...state, loading: false, current: action.payload };
    case BranchesActionTypes.SAVE_SUCCESS:
    case BranchesActionTypes.DELETE_SUCCESS:
      return { ...state, loading: false, lastResponse: action.payload };
    case BranchesActionTypes.FETCH_LIST_FAILURE:
    case BranchesActionTypes.FETCH_ONE_FAILURE:
    case BranchesActionTypes.SAVE_FAILURE:
    case BranchesActionTypes.DELETE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case BranchesActionTypes.RESET_RESPONSE:
      return { ...state, lastResponse: null, error: null };
    default:
      return state;
  }
}
