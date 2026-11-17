/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: role redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { RoleActionTypes } from './role.types';
import { roleServices } from './role.services';
import {
  deleteRoleFailure,
  deleteRoleSuccess,
  fetchRoleListFailure,
  fetchRoleListSuccess,
  fetchRoleOneFailure,
  fetchRoleOneSuccess,
  saveRoleFailure,
  saveRoleSuccess,
} from './role.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(roleServices.list, action.payload);
    yield put(fetchRoleListSuccess(data));
  } catch (error: any) {
    yield put(fetchRoleListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(roleServices.getOne, action.payload);
    yield put(fetchRoleOneSuccess(data));
  } catch (error: any) {
    yield put(fetchRoleOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(roleServices.save, action.payload);
    yield put(saveRoleSuccess(data));
  } catch (error: any) {
    yield put(saveRoleFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(roleServices.remove, action.payload);
    yield put(deleteRoleSuccess(data));
  } catch (error: any) {
    yield put(deleteRoleFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* roleSaga() {
  yield takeLatest(RoleActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(RoleActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(RoleActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(RoleActionTypes.DELETE_REQUEST, deleteItem);
}
