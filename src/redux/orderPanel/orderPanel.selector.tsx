/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: orderPanel redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectOrderPanelState = (state: RootState) => state.orderPanel;
export const selectOrderPanelItems = (state: RootState) => state.orderPanel.items;
export const selectOrderPanelCurrent = (state: RootState) => state.orderPanel.current;
export const selectOrderPanelLoading = (state: RootState) => state.orderPanel.loading;
export const selectOrderPanelError = (state: RootState) => state.orderPanel.error;
export const selectOrderPanelLastResponse = (state: RootState) => state.orderPanel.lastResponse;
