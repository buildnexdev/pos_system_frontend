/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: accessControl redux actions
 * Edit Date: 2026-11-12
 */

import { AccessControlActionTypes } from './accessControl.types';

export const fetchAccessControlListRequest = (params?: any) => ({ type: AccessControlActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchAccessControlListSuccess = (payload: any[]) => ({ type: AccessControlActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchAccessControlListFailure = (payload: string) => ({ type: AccessControlActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchAccessControlOneRequest = (id: string | number) => ({ type: AccessControlActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchAccessControlOneSuccess = (payload: any) => ({ type: AccessControlActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchAccessControlOneFailure = (payload: string) => ({ type: AccessControlActionTypes.FETCH_ONE_FAILURE, payload });

export const saveAccessControlRequest = (payload: any) => ({ type: AccessControlActionTypes.SAVE_REQUEST, payload });
export const saveAccessControlSuccess = (payload: any) => ({ type: AccessControlActionTypes.SAVE_SUCCESS, payload });
export const saveAccessControlFailure = (payload: string) => ({ type: AccessControlActionTypes.SAVE_FAILURE, payload });

export const deleteAccessControlRequest = (id: string | number) => ({ type: AccessControlActionTypes.DELETE_REQUEST, payload: id });
export const deleteAccessControlSuccess = (payload: any) => ({ type: AccessControlActionTypes.DELETE_SUCCESS, payload });
export const deleteAccessControlFailure = (payload: string) => ({ type: AccessControlActionTypes.DELETE_FAILURE, payload });

export const resetAccessControlResponse = () => ({ type: AccessControlActionTypes.RESET_RESPONSE });
