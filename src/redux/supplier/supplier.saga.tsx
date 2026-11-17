/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: supplier redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { SupplierActionTypes } from './supplier.types';
import { supplierServices } from './supplier.services';
import {
  deleteSupplierFailure,
  deleteSupplierSuccess,
  fetchSupplierListFailure,
  fetchSupplierListSuccess,
  fetchSupplierOneFailure,
  fetchSupplierOneSuccess,
  saveSupplierFailure,
  saveSupplierSuccess,
} from './supplier.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(supplierServices.list, action.payload);
    yield put(fetchSupplierListSuccess(data));
  } catch (error: any) {
    yield put(fetchSupplierListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(supplierServices.getOne, action.payload);
    yield put(fetchSupplierOneSuccess(data));
  } catch (error: any) {
    yield put(fetchSupplierOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(supplierServices.save, action.payload);
    yield put(saveSupplierSuccess(data));
  } catch (error: any) {
    yield put(saveSupplierFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(supplierServices.remove, action.payload);
    yield put(deleteSupplierSuccess(data));
  } catch (error: any) {
    yield put(deleteSupplierFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* supplierSaga() {
  yield takeLatest(SupplierActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(SupplierActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(SupplierActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(SupplierActionTypes.DELETE_REQUEST, deleteItem);
}
