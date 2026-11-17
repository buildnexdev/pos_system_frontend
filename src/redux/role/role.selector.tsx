/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: role redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectRoleState = (state: RootState) => state.role;
export const selectRoleItems = (state: RootState) => state.role.items;
export const selectRoleCurrent = (state: RootState) => state.role.current;
export const selectRoleLoading = (state: RootState) => state.role.loading;
export const selectRoleError = (state: RootState) => state.role.error;
export const selectRoleLastResponse = (state: RootState) => state.role.lastResponse;
