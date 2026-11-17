/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: warehouse redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectWarehouseState = (state: RootState) => state.warehouse;
export const selectWarehouseItems = (state: RootState) => state.warehouse.items;
export const selectWarehouseCurrent = (state: RootState) => state.warehouse.current;
export const selectWarehouseLoading = (state: RootState) => state.warehouse.loading;
export const selectWarehouseError = (state: RootState) => state.warehouse.error;
export const selectWarehouseLastResponse = (state: RootState) => state.warehouse.lastResponse;
