import { CartActionTypes, CartState } from './cart.types';

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  count: 0,
  loading: false,
  error: null,
};

function fromCart(cart: any): Partial<CartState> {
  return {
    items: cart?.items || [],
    subtotal: cart?.subtotal || 0,
    shipping: cart?.shipping || 0,
    total: cart?.total || 0,
    count: cart?.count || 0,
  };
}

export default function cartReducer(state = initialState, action: any): CartState {
  switch (action.type) {
    case CartActionTypes.FETCH_CART_REQUEST:
    case CartActionTypes.ADD_TO_CART_REQUEST:
    case CartActionTypes.UPDATE_CART_REQUEST:
    case CartActionTypes.REMOVE_CART_REQUEST:
      return { ...state, loading: true, error: null };
    case CartActionTypes.FETCH_CART_SUCCESS:
      return { ...state, loading: false, ...fromCart(action.payload) };
    case CartActionTypes.FETCH_CART_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CartActionTypes.CLEAR_CART:
      return { ...initialState };
    default:
      return state;
  }
}
