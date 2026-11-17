/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: productType redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { ProductTypeActionTypes } from './productType.types';
import { productTypeServices } from './productType.services';
import {
  deleteProductTypeFailure,
  deleteProductTypeSuccess,
  fetchProductTypeListFailure,
  fetchProductTypeListSuccess,
  fetchProductTypeOneFailure,
  fetchProductTypeOneSuccess,
  saveProductTypeFailure,
  saveProductTypeSuccess,
} from './productType.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(productTypeServices.list, action.payload);
    yield put(fetchProductTypeListSuccess(data));
  } catch (error: any) {
    yield put(fetchProductTypeListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(productTypeServices.getOne, action.payload);
    yield put(fetchProductTypeOneSuccess(data));
  } catch (error: any) {
    yield put(fetchProductTypeOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(productTypeServices.save, action.payload);
    yield put(saveProductTypeSuccess(data));
  } catch (error: any) {
    yield put(saveProductTypeFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(productTypeServices.remove, action.payload);
    yield put(deleteProductTypeSuccess(data));
  } catch (error: any) {
    yield put(deleteProductTypeFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* productTypeSaga() {
  yield takeLatest(ProductTypeActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(ProductTypeActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(ProductTypeActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(ProductTypeActionTypes.DELETE_REQUEST, deleteItem);
}
