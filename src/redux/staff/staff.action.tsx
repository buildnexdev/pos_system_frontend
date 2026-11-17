/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: staff redux actions
 * Edit Date: 2026-11-12
 */

import { StaffActionTypes } from './staff.types';

export const fetchStaffListRequest = (params?: any) => ({ type: StaffActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchStaffListSuccess = (payload: any[]) => ({ type: StaffActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchStaffListFailure = (payload: string) => ({ type: StaffActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchStaffOneRequest = (id: string | number) => ({ type: StaffActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchStaffOneSuccess = (payload: any) => ({ type: StaffActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchStaffOneFailure = (payload: string) => ({ type: StaffActionTypes.FETCH_ONE_FAILURE, payload });

export const saveStaffRequest = (payload: any) => ({ type: StaffActionTypes.SAVE_REQUEST, payload });
export const saveStaffSuccess = (payload: any) => ({ type: StaffActionTypes.SAVE_SUCCESS, payload });
export const saveStaffFailure = (payload: string) => ({ type: StaffActionTypes.SAVE_FAILURE, payload });

export const deleteStaffRequest = (id: string | number) => ({ type: StaffActionTypes.DELETE_REQUEST, payload: id });
export const deleteStaffSuccess = (payload: any) => ({ type: StaffActionTypes.DELETE_SUCCESS, payload });
export const deleteStaffFailure = (payload: string) => ({ type: StaffActionTypes.DELETE_FAILURE, payload });

export const resetStaffResponse = () => ({ type: StaffActionTypes.RESET_RESPONSE });
