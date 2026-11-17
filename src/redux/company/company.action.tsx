/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: company redux actions
 * Edit Date: 2026-11-14
 */

import { CompanyActionTypes } from './company.types';

export const fetchCompanyListRequest = (params?: any) => ({ type: CompanyActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchCompanyListSuccess = (payload: any[]) => ({ type: CompanyActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchCompanyListFailure = (payload: string) => ({ type: CompanyActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchCompanyOneRequest = (id: string | number) => ({ type: CompanyActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchCompanyOneSuccess = (payload: any) => ({ type: CompanyActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchCompanyOneFailure = (payload: string) => ({ type: CompanyActionTypes.FETCH_ONE_FAILURE, payload });

export const saveCompanyRequest = (payload: any) => ({ type: CompanyActionTypes.SAVE_REQUEST, payload });
export const saveCompanySuccess = (payload: any) => ({ type: CompanyActionTypes.SAVE_SUCCESS, payload });
export const saveCompanyFailure = (payload: string) => ({ type: CompanyActionTypes.SAVE_FAILURE, payload });

export const deleteCompanyRequest = (id: string | number) => ({ type: CompanyActionTypes.DELETE_REQUEST, payload: id });
export const deleteCompanySuccess = (payload: any) => ({ type: CompanyActionTypes.DELETE_SUCCESS, payload });
export const deleteCompanyFailure = (payload: string) => ({ type: CompanyActionTypes.DELETE_FAILURE, payload });

export const resetCompanyResponse = () => ({ type: CompanyActionTypes.RESET_RESPONSE });
