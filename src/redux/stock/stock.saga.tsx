/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: stock redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { StockActionTypes } from './stock.types';
import { stockServices } from './stock.services';
import {
  deleteStockFailure,
  deleteStockSuccess,
  fetchStockListFailure,
  fetchStockListSuccess,
  fetchStockOneFailure,
  fetchStockOneSuccess,
  saveStockFailure,
  saveStockSuccess,
} from './stock.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(stockServices.list, action.payload);
    yield put(fetchStockListSuccess(data));
  } catch (error: any) {
    yield put(fetchStockListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(stockServices.getOne, action.payload);
    yield put(fetchStockOneSuccess(data));
  } catch (error: any) {
    yield put(fetchStockOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(stockServices.save, action.payload);
    yield put(saveStockSuccess(data));
  } catch (error: any) {
    yield put(saveStockFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(stockServices.remove, action.payload);
    yield put(deleteStockSuccess(data));
  } catch (error: any) {
    yield put(deleteStockFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* stockSaga() {
  yield takeLatest(StockActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(StockActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(StockActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(StockActionTypes.DELETE_REQUEST, deleteItem);
}
