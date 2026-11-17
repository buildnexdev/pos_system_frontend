/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: orderPanel redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { OrderPanelActionTypes } from './orderPanel.types';
import { orderPanelServices } from './orderPanel.services';
import {
  deleteOrderPanelFailure,
  deleteOrderPanelSuccess,
  fetchOrderPanelListFailure,
  fetchOrderPanelListSuccess,
  fetchOrderPanelOneFailure,
  fetchOrderPanelOneSuccess,
  saveOrderPanelFailure,
  saveOrderPanelSuccess,
} from './orderPanel.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(orderPanelServices.list, action.payload);
    yield put(fetchOrderPanelListSuccess(data));
  } catch (error: any) {
    yield put(fetchOrderPanelListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(orderPanelServices.getOne, action.payload);
    yield put(fetchOrderPanelOneSuccess(data));
  } catch (error: any) {
    yield put(fetchOrderPanelOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(orderPanelServices.save, action.payload);
    yield put(saveOrderPanelSuccess(data));
  } catch (error: any) {
    yield put(saveOrderPanelFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(orderPanelServices.remove, action.payload);
    yield put(deleteOrderPanelSuccess(data));
  } catch (error: any) {
    yield put(deleteOrderPanelFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* orderPanelSaga() {
  yield takeLatest(OrderPanelActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(OrderPanelActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(OrderPanelActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(OrderPanelActionTypes.DELETE_REQUEST, deleteItem);
}
