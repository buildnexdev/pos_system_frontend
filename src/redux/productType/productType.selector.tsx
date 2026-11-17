/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: productType redux selectors
 * Edit Date: 2026-11-12
 */

import { RootState } from '../store';

export const selectProductTypeState = (state: RootState) => state.productType;
export const selectProductTypeItems = (state: RootState) => state.productType.items;
export const selectProductTypeCurrent = (state: RootState) => state.productType.current;
export const selectProductTypeLoading = (state: RootState) => state.productType.loading;
export const selectProductTypeError = (state: RootState) => state.productType.error;
export const selectProductTypeLastResponse = (state: RootState) => state.productType.lastResponse;
