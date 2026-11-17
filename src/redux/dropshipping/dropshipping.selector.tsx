/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dropshipping redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectDropshippingState = (state: RootState) => state.dropshipping;
export const selectDropshippingItems = (state: RootState) => state.dropshipping.items;
export const selectDropshippingCurrent = (state: RootState) => state.dropshipping.current;
export const selectDropshippingLoading = (state: RootState) => state.dropshipping.loading;
export const selectDropshippingError = (state: RootState) => state.dropshipping.error;
export const selectDropshippingLastResponse = (state: RootState) => state.dropshipping.lastResponse;
