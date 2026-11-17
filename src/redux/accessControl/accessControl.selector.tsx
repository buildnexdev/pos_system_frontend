/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: accessControl redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectAccessControlState = (state: RootState) => state.accessControl;
export const selectAccessControlItems = (state: RootState) => state.accessControl.items;
export const selectAccessControlCurrent = (state: RootState) => state.accessControl.current;
export const selectAccessControlLoading = (state: RootState) => state.accessControl.loading;
export const selectAccessControlError = (state: RootState) => state.accessControl.error;
export const selectAccessControlLastResponse = (state: RootState) => state.accessControl.lastResponse;
