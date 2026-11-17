/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: support redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { SupportActionTypes } from './support.types';
import { supportServices } from './support.services';
import {
  deleteSupportFailure,
  deleteSupportSuccess,
  fetchSupportListFailure,
  fetchSupportListSuccess,
  fetchSupportOneFailure,
  fetchSupportOneSuccess,
  saveSupportFailure,
  saveSupportSuccess,
} from './support.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(supportServices.list, action.payload);
    yield put(fetchSupportListSuccess(data));
  } catch (error: any) {
    yield put(fetchSupportListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(supportServices.getOne, action.payload);
    yield put(fetchSupportOneSuccess(data));
  } catch (error: any) {
    yield put(fetchSupportOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(supportServices.save, action.payload);
    yield put(saveSupportSuccess(data));
  } catch (error: any) {
    yield put(saveSupportFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(supportServices.remove, action.payload);
    yield put(deleteSupportSuccess(data));
  } catch (error: any) {
    yield put(deleteSupportFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* supportSaga() {
  yield takeLatest(SupportActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(SupportActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(SupportActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(SupportActionTypes.DELETE_REQUEST, deleteItem);
}
