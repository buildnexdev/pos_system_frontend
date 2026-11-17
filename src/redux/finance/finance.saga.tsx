/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: finance redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { FinanceActionTypes } from './finance.types';
import { financeServices } from './finance.services';
import {
  deleteFinanceFailure,
  deleteFinanceSuccess,
  fetchFinanceListFailure,
  fetchFinanceListSuccess,
  fetchFinanceOneFailure,
  fetchFinanceOneSuccess,
  saveFinanceFailure,
  saveFinanceSuccess,
} from './finance.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(financeServices.list, action.payload);
    yield put(fetchFinanceListSuccess(data));
  } catch (error: any) {
    yield put(fetchFinanceListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(financeServices.getOne, action.payload);
    yield put(fetchFinanceOneSuccess(data));
  } catch (error: any) {
    yield put(fetchFinanceOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(financeServices.save, action.payload);
    yield put(saveFinanceSuccess(data));
  } catch (error: any) {
    yield put(saveFinanceFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(financeServices.remove, action.payload);
    yield put(deleteFinanceSuccess(data));
  } catch (error: any) {
    yield put(deleteFinanceFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* financeSaga() {
  yield takeLatest(FinanceActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(FinanceActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(FinanceActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(FinanceActionTypes.DELETE_REQUEST, deleteItem);
}
