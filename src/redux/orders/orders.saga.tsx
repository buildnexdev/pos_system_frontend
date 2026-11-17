/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: Customer orders redux sagas
 * Edit Date: 2026-11-12
 */
import { call, put, takeLatest } from 'redux-saga/effects';
import { OrdersActionTypes } from './orders.types';
import { ordersServices } from './orders.services';
import {
  cancelOrderFailure,
  cancelOrderSuccess,
  fetchOrderFailure,
  fetchOrderSuccess,
  fetchOrdersFailure,
  fetchOrdersSuccess,
  placeOrderFailure,
  placeOrderSuccess,
} from './orders.action';

function* placeOrder(action: any): Generator {
  try {
    const data: any = yield call(ordersServices.placeOrder, action.payload);
    yield put(placeOrderSuccess(data));
  } catch (error: any) {
    yield put(placeOrderFailure(error.response?.data?.message || error.message || 'Failed to place order'));
  }
}

function* fetchOrders(): Generator {
  try {
    const data: any = yield call(ordersServices.getOrders);
    yield put(fetchOrdersSuccess(data));
  } catch (error: any) {
    yield put(fetchOrdersFailure(error.response?.data?.message || error.message || 'Failed to load orders'));
  }
}

function* fetchOrder(action: any): Generator {
  try {
    const data: any = yield call(ordersServices.getOrder, action.payload);
    yield put(fetchOrderSuccess(data));
  } catch (error: any) {
    yield put(fetchOrderFailure(error.response?.data?.message || error.message || 'Failed to load order'));
  }
}

function* cancelOrder(action: any): Generator {
  try {
    const data: any = yield call(ordersServices.cancelOrder, action.payload);
    yield put(cancelOrderSuccess(data));
  } catch (error: any) {
    yield put(cancelOrderFailure(error.response?.data?.message || error.message || 'Failed to cancel order'));
  }
}

export default function* ordersSaga() {
  yield takeLatest(OrdersActionTypes.PLACE_ORDER_REQUEST, placeOrder);
  yield takeLatest(OrdersActionTypes.FETCH_ORDERS_REQUEST, fetchOrders);
  yield takeLatest(OrdersActionTypes.FETCH_ORDER_REQUEST, fetchOrder);
  yield takeLatest(OrdersActionTypes.CANCEL_ORDER_REQUEST, cancelOrder);
}
