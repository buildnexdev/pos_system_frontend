export const ShopActionTypes = {
  FETCH_HOME_REQUEST: 'FETCH_HOME_REQUEST',
  FETCH_HOME_SUCCESS: 'FETCH_HOME_SUCCESS',
  FETCH_HOME_FAILURE: 'FETCH_HOME_FAILURE',
  FETCH_PRODUCTS_REQUEST: 'FETCH_PRODUCTS_REQUEST',
  FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
  FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
  FETCH_PRODUCT_REQUEST: 'FETCH_PRODUCT_REQUEST',
  FETCH_PRODUCT_SUCCESS: 'FETCH_PRODUCT_SUCCESS',
  FETCH_PRODUCT_FAILURE: 'FETCH_PRODUCT_FAILURE',
} as const;

export interface ShopState {
  categories: any[];
  featured: any[];
  latest: any[];
  products: any[];
  product: any | null;
  images: any[];
  related: any[];
  inWishlist: boolean;
  loading: boolean;
  error: string | null;
}
