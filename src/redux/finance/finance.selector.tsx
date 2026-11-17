/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: finance redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectFinanceState = (state: RootState) => state.finance;
export const selectFinanceItems = (state: RootState) => state.finance.items;
export const selectFinanceCurrent = (state: RootState) => state.finance.current;
export const selectFinanceLoading = (state: RootState) => state.finance.loading;
export const selectFinanceError = (state: RootState) => state.finance.error;
export const selectFinanceLastResponse = (state: RootState) => state.finance.lastResponse;
