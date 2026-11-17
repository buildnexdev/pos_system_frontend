import { ShopActionTypes } from './shop.types';

export const fetchHomeRequest = () => ({ type: ShopActionTypes.FETCH_HOME_REQUEST });
export const fetchHomeSuccess = (payload: any) => ({ type: ShopActionTypes.FETCH_HOME_SUCCESS, payload });
export const fetchHomeFailure = (error: string) => ({ type: ShopActionTypes.FETCH_HOME_FAILURE, payload: error });

export const fetchProductsRequest = (filters: Record<string, any> = {}) => ({
  type: ShopActionTypes.FETCH_PRODUCTS_REQUEST,
  payload: filters,
});
export const fetchProductsSuccess = (products: any[]) => ({
  type: ShopActionTypes.FETCH_PRODUCTS_SUCCESS,
  payload: products,
});
export const fetchProductsFailure = (error: string) => ({
  type: ShopActionTypes.FETCH_PRODUCTS_FAILURE,
  payload: error,
});

export const fetchProductRequest = (slug: string) => ({
  type: ShopActionTypes.FETCH_PRODUCT_REQUEST,
  payload: slug,
});
export const fetchProductSuccess = (payload: any) => ({
  type: ShopActionTypes.FETCH_PRODUCT_SUCCESS,
  payload,
});
export const fetchProductFailure = (error: string) => ({
  type: ShopActionTypes.FETCH_PRODUCT_FAILURE,
  payload: error,
});
