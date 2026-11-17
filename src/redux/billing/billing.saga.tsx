/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: billing redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { BillingActionTypes } from './billing.types';
import { billingServices } from './billing.services';
import {
  deleteBillingFailure,
  deleteBillingSuccess,
  fetchBillingListFailure,
  fetchBillingListSuccess,
  fetchBillingOneFailure,
  fetchBillingOneSuccess,
  saveBillingFailure,
  saveBillingSuccess,
} from './billing.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(billingServices.list, action.payload);
    yield put(fetchBillingListSuccess(data));
  } catch (error: any) {
    yield put(fetchBillingListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(billingServices.getOne, action.payload);
    yield put(fetchBillingOneSuccess(data));
  } catch (error: any) {
    yield put(fetchBillingOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(billingServices.save, action.payload);
    yield put(saveBillingSuccess(data));
  } catch (error: any) {
    yield put(saveBillingFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(billingServices.remove, action.payload);
    yield put(deleteBillingSuccess(data));
  } catch (error: any) {
    yield put(deleteBillingFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* billingSaga() {
  yield takeLatest(BillingActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(BillingActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(BillingActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(BillingActionTypes.DELETE_REQUEST, deleteItem);
}
