/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Shop redux selectors
 * Edit Date: 2026-11-12
 */
import { RootState } from '../store';

// SE
export const selectShopState = (state: RootState) => state.shop;
export const selectShopCategories = (state: RootState) => state.shop.categories;
export const selectShopFeatured = (state: RootState) => state.shop.featured;
export const selectShopLatest = (state: RootState) => state.shop.latest;
export const selectShopProducts = (state: RootState) => state.shop.products;
export const selectShopProduct = (state: RootState) => state.shop.product;
export const selectShopLoading = (state: RootState) => state.shop.loading;
export const selectShopError = (state: RootState) => state.shop.error;
