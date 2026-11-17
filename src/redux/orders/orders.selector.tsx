/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer orders redux selectors
 * Edit Date: 2026-11-12
 */
import { RootState } from '../store';

export const selectOrdersState = (state: RootState) => state.orders;
export const selectOrdersItems = (state: RootState) => state.orders.items;
export const selectOrdersCurrent = (state: RootState) => state.orders.current;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;
