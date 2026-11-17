/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: billing redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectBillingState = (state: RootState) => state.billing;
export const selectBillingItems = (state: RootState) => state.billing.items;
export const selectBillingCurrent = (state: RootState) => state.billing.current;
export const selectBillingLoading = (state: RootState) => state.billing.loading;
export const selectBillingError = (state: RootState) => state.billing.error;
export const selectBillingLastResponse = (state: RootState) => state.billing.lastResponse;
