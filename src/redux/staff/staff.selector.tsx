/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: staff redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectStaffState = (state: RootState) => state.staff;
export const selectStaffItems = (state: RootState) => state.staff.items;
export const selectStaffCurrent = (state: RootState) => state.staff.current;
export const selectStaffLoading = (state: RootState) => state.staff.loading;
export const selectStaffError = (state: RootState) => state.staff.error;
export const selectStaffLastResponse = (state: RootState) => state.staff.lastResponse;
