import { CartActionTypes } from './cart.types';

export const fetchCartRequest = () => ({ type: CartActionTypes.FETCH_CART_REQUEST });
export const fetchCartSuccess = (cart: any) => ({ type: CartActionTypes.FETCH_CART_SUCCESS, payload: cart });
export const fetchCartFailure = (error: string) => ({ type: CartActionTypes.FETCH_CART_FAILURE, payload: error });

export const addToCartRequest = (payload: any) => ({ type: CartActionTypes.ADD_TO_CART_REQUEST, payload });
export const updateCartRequest = (id: number, quantity: number) => ({
  type: CartActionTypes.UPDATE_CART_REQUEST,
  payload: { id, quantity },
});
export const removeCartRequest = (id: number) => ({ type: CartActionTypes.REMOVE_CART_REQUEST, payload: id });
export const clearCart = () => ({ type: CartActionTypes.CLEAR_CART });
