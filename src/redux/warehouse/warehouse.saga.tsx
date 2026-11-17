/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: warehouse redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { WarehouseActionTypes } from './warehouse.types';
import { warehouseServices } from './warehouse.services';
import {
  deleteWarehouseFailure,
  deleteWarehouseSuccess,
  fetchWarehouseListFailure,
  fetchWarehouseListSuccess,
  fetchWarehouseOneFailure,
  fetchWarehouseOneSuccess,
  saveWarehouseFailure,
  saveWarehouseSuccess,
} from './warehouse.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(warehouseServices.list, action.payload);
    yield put(fetchWarehouseListSuccess(data));
  } catch (error: any) {
    yield put(fetchWarehouseListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(warehouseServices.getOne, action.payload);
    yield put(fetchWarehouseOneSuccess(data));
  } catch (error: any) {
    yield put(fetchWarehouseOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(warehouseServices.save, action.payload);
    yield put(saveWarehouseSuccess(data));
  } catch (error: any) {
    yield put(saveWarehouseFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(warehouseServices.remove, action.payload);
    yield put(deleteWarehouseSuccess(data));
  } catch (error: any) {
    yield put(deleteWarehouseFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* warehouseSaga() {
  yield takeLatest(WarehouseActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(WarehouseActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(WarehouseActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(WarehouseActionTypes.DELETE_REQUEST, deleteItem);
}
