/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: stock redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectStockState = (state: RootState) => state.stock;
export const selectStockItems = (state: RootState) => state.stock.items;
export const selectStockCurrent = (state: RootState) => state.stock.current;
export const selectStockLoading = (state: RootState) => state.stock.loading;
export const selectStockError = (state: RootState) => state.stock.error;
export const selectStockLastResponse = (state: RootState) => state.stock.lastResponse;
