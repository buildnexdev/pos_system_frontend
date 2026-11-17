/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: paymentGateway redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { PaymentGatewayActionTypes } from './paymentGateway.types';
import { paymentGatewayServices } from './paymentGateway.services';
import {
  deletePaymentGatewayFailure,
  deletePaymentGatewaySuccess,
  fetchPaymentGatewayListFailure,
  fetchPaymentGatewayListSuccess,
  fetchPaymentGatewayOneFailure,
  fetchPaymentGatewayOneSuccess,
  savePaymentGatewayFailure,
  savePaymentGatewaySuccess,
} from './paymentGateway.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(paymentGatewayServices.list, action.payload);
    yield put(fetchPaymentGatewayListSuccess(data));
  } catch (error: any) {
    yield put(fetchPaymentGatewayListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(paymentGatewayServices.getOne, action.payload);
    yield put(fetchPaymentGatewayOneSuccess(data));
  } catch (error: any) {
    yield put(fetchPaymentGatewayOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(paymentGatewayServices.save, action.payload);
    yield put(savePaymentGatewaySuccess(data));
  } catch (error: any) {
    yield put(savePaymentGatewayFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(paymentGatewayServices.remove, action.payload);
    yield put(deletePaymentGatewaySuccess(data));
  } catch (error: any) {
    yield put(deletePaymentGatewayFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* paymentGatewaySaga() {
  yield takeLatest(PaymentGatewayActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(PaymentGatewayActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(PaymentGatewayActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(PaymentGatewayActionTypes.DELETE_REQUEST, deleteItem);
}
