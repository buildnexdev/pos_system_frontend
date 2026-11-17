/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: role redux actions
 * Edit Date: 2026-11-12
 */

import { RoleActionTypes } from './role.types';

export const fetchRoleListRequest = (params?: any) => ({ type: RoleActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchRoleListSuccess = (payload: any[]) => ({ type: RoleActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchRoleListFailure = (payload: string) => ({ type: RoleActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchRoleOneRequest = (id: string | number) => ({ type: RoleActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchRoleOneSuccess = (payload: any) => ({ type: RoleActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchRoleOneFailure = (payload: string) => ({ type: RoleActionTypes.FETCH_ONE_FAILURE, payload });

export const saveRoleRequest = (payload: any) => ({ type: RoleActionTypes.SAVE_REQUEST, payload });
export const saveRoleSuccess = (payload: any) => ({ type: RoleActionTypes.SAVE_SUCCESS, payload });
export const saveRoleFailure = (payload: string) => ({ type: RoleActionTypes.SAVE_FAILURE, payload });

export const deleteRoleRequest = (id: string | number) => ({ type: RoleActionTypes.DELETE_REQUEST, payload: id });
export const deleteRoleSuccess = (payload: any) => ({ type: RoleActionTypes.DELETE_SUCCESS, payload });
export const deleteRoleFailure = (payload: string) => ({ type: RoleActionTypes.DELETE_FAILURE, payload });

export const resetRoleResponse = () => ({ type: RoleActionTypes.RESET_RESPONSE });
