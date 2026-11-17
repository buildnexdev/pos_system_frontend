/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: report redux actions
 * Edit Date: 2026-11-12
 */

import { ReportActionTypes } from './report.types';

export const fetchReportListRequest = (params?: any) => ({ type: ReportActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchReportListSuccess = (payload: any[]) => ({ type: ReportActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchReportListFailure = (payload: string) => ({ type: ReportActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchReportOneRequest = (id: string | number) => ({ type: ReportActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchReportOneSuccess = (payload: any) => ({ type: ReportActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchReportOneFailure = (payload: string) => ({ type: ReportActionTypes.FETCH_ONE_FAILURE, payload });

export const saveReportRequest = (payload: any) => ({ type: ReportActionTypes.SAVE_REQUEST, payload });
export const saveReportSuccess = (payload: any) => ({ type: ReportActionTypes.SAVE_SUCCESS, payload });
export const saveReportFailure = (payload: string) => ({ type: ReportActionTypes.SAVE_FAILURE, payload });

export const deleteReportRequest = (id: string | number) => ({ type: ReportActionTypes.DELETE_REQUEST, payload: id });
export const deleteReportSuccess = (payload: any) => ({ type: ReportActionTypes.DELETE_SUCCESS, payload });
export const deleteReportFailure = (payload: string) => ({ type: ReportActionTypes.DELETE_FAILURE, payload });

export const resetReportResponse = () => ({ type: ReportActionTypes.RESET_RESPONSE });
