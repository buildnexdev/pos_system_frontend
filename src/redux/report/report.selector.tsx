/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: report redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectReportState = (state: RootState) => state.report;
export const selectReportItems = (state: RootState) => state.report.items;
export const selectReportCurrent = (state: RootState) => state.report.current;
export const selectReportLoading = (state: RootState) => state.report.loading;
export const selectReportError = (state: RootState) => state.report.error;
export const selectReportLastResponse = (state: RootState) => state.report.lastResponse;
