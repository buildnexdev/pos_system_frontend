/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: accessControl redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { AccessControlActionTypes } from './accessControl.types';
import { accessControlServices } from './accessControl.services';
import {
  deleteAccessControlFailure,
  deleteAccessControlSuccess,
  fetchAccessControlListFailure,
  fetchAccessControlListSuccess,
  fetchAccessControlOneFailure,
  fetchAccessControlOneSuccess,
  saveAccessControlFailure,
  saveAccessControlSuccess,
} from './accessControl.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(accessControlServices.list, action.payload);
    yield put(fetchAccessControlListSuccess(data));
  } catch (error: any) {
    yield put(fetchAccessControlListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(accessControlServices.getOne, action.payload);
    yield put(fetchAccessControlOneSuccess(data));
  } catch (error: any) {
    yield put(fetchAccessControlOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(accessControlServices.save, action.payload);
    yield put(saveAccessControlSuccess(data));
  } catch (error: any) {
    yield put(saveAccessControlFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(accessControlServices.remove, action.payload);
    yield put(deleteAccessControlSuccess(data));
  } catch (error: any) {
    yield put(deleteAccessControlFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* accessControlSaga() {
  yield takeLatest(AccessControlActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(AccessControlActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(AccessControlActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(AccessControlActionTypes.DELETE_REQUEST, deleteItem);
}
