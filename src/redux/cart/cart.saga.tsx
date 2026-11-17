import { takeLatest, put, call } from 'redux-saga/effects';
import toast from 'react-hot-toast';
import { CartActionTypes } from './cart.types';
import { cartService } from './cart.services';

function* fetchCart(): Generator {
  try {
    const cart: any = yield call(cartService.getCart);
    yield put({ type: CartActionTypes.FETCH_CART_SUCCESS, payload: cart });
  } catch (error: any) {
    yield put({
      type: CartActionTypes.FETCH_CART_FAILURE,
      payload: error.response?.data?.message || 'Failed to load cart',
    });
  }
}

function* addToCart(action: any): Generator {
  try {
    const cart: any = yield call(cartService.addToCart, action.payload);
    yield put({ type: CartActionTypes.FETCH_CART_SUCCESS, payload: cart });
    toast.success('Added to cart');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Could not add to cart');
    yield put({
      type: CartActionTypes.FETCH_CART_FAILURE,
      payload: error.response?.data?.message || 'Could not add to cart',
    });
  }
}

function* updateCart(action: any): Generator {
  try {
    const cart: any = yield call(cartService.updateCart, action.payload.id, action.payload.quantity);
    yield put({ type: CartActionTypes.FETCH_CART_SUCCESS, payload: cart });
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Could not update cart');
    yield put({
      type: CartActionTypes.FETCH_CART_FAILURE,
      payload: error.response?.data?.message || 'Could not update cart',
    });
  }
}

function* removeCart(action: any): Generator {
  try {
    const cart: any = yield call(cartService.removeFromCart, action.payload);
    yield put({ type: CartActionTypes.FETCH_CART_SUCCESS, payload: cart });
    toast.success('Item removed');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Could not remove item');
    yield put({
      type: CartActionTypes.FETCH_CART_FAILURE,
      payload: error.response?.data?.message || 'Could not remove item',
    });
  }
}

export default function* cartSaga() {
  yield takeLatest(CartActionTypes.FETCH_CART_REQUEST, fetchCart);
  yield takeLatest(CartActionTypes.ADD_TO_CART_REQUEST, addToCart);
  yield takeLatest(CartActionTypes.UPDATE_CART_REQUEST, updateCart);
  yield takeLatest(CartActionTypes.REMOVE_CART_REQUEST, removeCart);
}
