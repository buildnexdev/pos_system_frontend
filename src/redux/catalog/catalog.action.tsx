/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: catalog redux actions
 * Edit Date: 2026-11-12
 */

import { CatalogActionTypes } from './catalog.types';

export const fetchCatalogListRequest = (params?: any) => ({ type: CatalogActionTypes.FETCH_LIST_REQUEST, payload: params || {} });
export const fetchCatalogListSuccess = (payload: any[]) => ({ type: CatalogActionTypes.FETCH_LIST_SUCCESS, payload });
export const fetchCatalogListFailure = (payload: string) => ({ type: CatalogActionTypes.FETCH_LIST_FAILURE, payload });

export const fetchCatalogOneRequest = (id: string | number) => ({ type: CatalogActionTypes.FETCH_ONE_REQUEST, payload: id });
export const fetchCatalogOneSuccess = (payload: any) => ({ type: CatalogActionTypes.FETCH_ONE_SUCCESS, payload });
export const fetchCatalogOneFailure = (payload: string) => ({ type: CatalogActionTypes.FETCH_ONE_FAILURE, payload });

export const saveCatalogRequest = (payload: any) => ({ type: CatalogActionTypes.SAVE_REQUEST, payload });
export const saveCatalogSuccess = (payload: any) => ({ type: CatalogActionTypes.SAVE_SUCCESS, payload });
export const saveCatalogFailure = (payload: string) => ({ type: CatalogActionTypes.SAVE_FAILURE, payload });

export const deleteCatalogRequest = (id: string | number) => ({ type: CatalogActionTypes.DELETE_REQUEST, payload: id });
export const deleteCatalogSuccess = (payload: any) => ({ type: CatalogActionTypes.DELETE_SUCCESS, payload });
export const deleteCatalogFailure = (payload: string) => ({ type: CatalogActionTypes.DELETE_FAILURE, payload });

export const resetCatalogResponse = () => ({ type: CatalogActionTypes.RESET_RESPONSE });
