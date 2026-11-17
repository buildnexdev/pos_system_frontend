/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: catalog redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectCatalogState = (state: RootState) => state.catalog;
export const selectCatalogItems = (state: RootState) => state.catalog.items;
export const selectCatalogCurrent = (state: RootState) => state.catalog.current;
export const selectCatalogLoading = (state: RootState) => state.catalog.loading;
export const selectCatalogError = (state: RootState) => state.catalog.error;
export const selectCatalogLastResponse = (state: RootState) => state.catalog.lastResponse;
