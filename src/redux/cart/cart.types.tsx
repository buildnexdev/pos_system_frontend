export const CartActionTypes = {
  FETCH_CART_REQUEST: 'FETCH_CART_REQUEST',
  FETCH_CART_SUCCESS: 'FETCH_CART_SUCCESS',
  FETCH_CART_FAILURE: 'FETCH_CART_FAILURE',
  ADD_TO_CART_REQUEST: 'ADD_TO_CART_REQUEST',
  UPDATE_CART_REQUEST: 'UPDATE_CART_REQUEST',
  REMOVE_CART_REQUEST: 'REMOVE_CART_REQUEST',
  CLEAR_CART: 'CLEAR_CART',
} as const;

export interface CartState {
  items: any[];
  subtotal: number;
  shipping: number;
  total: number;
  count: number;
  loading: boolean;
  error: string | null;
}
