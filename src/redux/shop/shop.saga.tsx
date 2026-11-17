import { takeLatest, put, call } from 'redux-saga/effects';
import { ShopActionTypes } from './shop.types';
import { shopService } from './shop.services';

function* fetchHome(): Generator {
  try {
    const data: any = yield call(shopService.getHome);
    yield put({ type: ShopActionTypes.FETCH_HOME_SUCCESS, payload: data });
  } catch (error: any) {
    yield put({
      type: ShopActionTypes.FETCH_HOME_FAILURE,
      payload: error.response?.data?.message || 'Failed to load home',
    });
  }
}

function* fetchProducts(action: any): Generator {
  try {
    const data: any = yield call(shopService.getProducts, action.payload);
    yield put({ type: ShopActionTypes.FETCH_PRODUCTS_SUCCESS, payload: data.products || [] });
  } catch (error: any) {
    yield put({
      type: ShopActionTypes.FETCH_PRODUCTS_FAILURE,
      payload: error.response?.data?.message || 'Failed to load products',
    });
  }
}

function* fetchProduct(action: any): Generator {
  try {
    const data: any = yield call(shopService.getProduct, action.payload);
    yield put({ type: ShopActionTypes.FETCH_PRODUCT_SUCCESS, payload: data });
  } catch (error: any) {
    yield put({
      type: ShopActionTypes.FETCH_PRODUCT_FAILURE,
      payload: error.response?.data?.message || 'Failed to load product',
    });
  }
}

export default function* shopSaga() {
  yield takeLatest(ShopActionTypes.FETCH_HOME_REQUEST, fetchHome);
  yield takeLatest(ShopActionTypes.FETCH_PRODUCTS_REQUEST, fetchProducts);
  yield takeLatest(ShopActionTypes.FETCH_PRODUCT_REQUEST, fetchProduct);
}
