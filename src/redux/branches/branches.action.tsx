/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: branches redux actions
 * Edit Date: 2026-11-12
 */

import { BranchesActionTypes } from './branches.types';

export const fetchBranchesListRequest = (params?: any) => ({ type: BranchesActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchBranchesListSuccess = (payload: any[]) => ({ type: BranchesActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchBranchesListFailure = (payload: string) => ({ type: BranchesActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchBranchesOneRequest = (id: string | number) => ({ type: BranchesActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchBranchesOneSuccess = (payload: any) => ({ type: BranchesActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchBranchesOneFailure = (payload: string) => ({ type: BranchesActionTypes.FETCH_ONE_FAILURE, payload });

export const saveBranchesRequest = (payload: any) => ({ type: BranchesActionTypes.SAVE_REQUEST, payload });
export const saveBranchesSuccess = (payload: any) => ({ type: BranchesActionTypes.SAVE_SUCCESS, payload });
export const saveBranchesFailure = (payload: string) => ({ type: BranchesActionTypes.SAVE_FAILURE, payload });

export const deleteBranchesRequest = (id: string | number) => ({ type: BranchesActionTypes.DELETE_REQUEST, payload: id });
export const deleteBranchesSuccess = (payload: any) => ({ type: BranchesActionTypes.DELETE_SUCCESS, payload });
export const deleteBranchesFailure = (payload: string) => ({ type: BranchesActionTypes.DELETE_FAILURE, payload });

export const resetBranchesResponse = () => ({ type: BranchesActionTypes.RESET_RESPONSE });
