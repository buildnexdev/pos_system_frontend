/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: branches redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectBranchesState = (state: RootState) => state.branches;
export const selectBranchesItems = (state: RootState) => state.branches.items;
export const selectBranchesCurrent = (state: RootState) => state.branches.current;
export const selectBranchesLoading = (state: RootState) => state.branches.loading;
export const selectBranchesError = (state: RootState) => state.branches.error;
export const selectBranchesLastResponse = (state: RootState) => state.branches.lastResponse;
