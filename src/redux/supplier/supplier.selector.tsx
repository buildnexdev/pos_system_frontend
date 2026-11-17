/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: supplier redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectSupplierState = (state: RootState) => state.supplier;
export const selectSupplierItems = (state: RootState) => state.supplier.items;
export const selectSupplierCurrent = (state: RootState) => state.supplier.current;
export const selectSupplierLoading = (state: RootState) => state.supplier.loading;
export const selectSupplierError = (state: RootState) => state.supplier.error;
export const selectSupplierLastResponse = (state: RootState) => state.supplier.lastResponse;
