/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dropshipping redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { DropshippingActionTypes } from './dropshipping.types';
import { dropshippingServices } from './dropshipping.services';
import {
  deleteDropshippingFailure,
  deleteDropshippingSuccess,
  fetchDropshippingListFailure,
  fetchDropshippingListSuccess,
  fetchDropshippingOneFailure,
  fetchDropshippingOneSuccess,
  saveDropshippingFailure,
  saveDropshippingSuccess,
} from './dropshipping.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(dropshippingServices.list, action.payload);
    yield put(fetchDropshippingListSuccess(data));
  } catch (error: any) {
    yield put(fetchDropshippingListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(dropshippingServices.getOne, action.payload);
    yield put(fetchDropshippingOneSuccess(data));
  } catch (error: any) {
    yield put(fetchDropshippingOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(dropshippingServices.save, action.payload);
    yield put(saveDropshippingSuccess(data));
  } catch (error: any) {
    yield put(saveDropshippingFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(dropshippingServices.remove, action.payload);
    yield put(deleteDropshippingSuccess(data));
  } catch (error: any) {
    yield put(deleteDropshippingFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* dropshippingSaga() {
  yield takeLatest(DropshippingActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(DropshippingActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(DropshippingActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(DropshippingActionTypes.DELETE_REQUEST, deleteItem);
}
