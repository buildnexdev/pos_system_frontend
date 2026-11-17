/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: support redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectSupportState = (state: RootState) => state.support;
export const selectSupportItems = (state: RootState) => state.support.items;
export const selectSupportCurrent = (state: RootState) => state.support.current;
export const selectSupportLoading = (state: RootState) => state.support.loading;
export const selectSupportError = (state: RootState) => state.support.error;
export const selectSupportLastResponse = (state: RootState) => state.support.lastResponse;
