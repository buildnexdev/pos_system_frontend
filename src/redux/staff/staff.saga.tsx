/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: staff redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { StaffActionTypes } from './staff.types';
import { staffServices } from './staff.services';
import {
  deleteStaffFailure,
  deleteStaffSuccess,
  fetchStaffListFailure,
  fetchStaffListSuccess,
  fetchStaffOneFailure,
  fetchStaffOneSuccess,
  saveStaffFailure,
  saveStaffSuccess,
} from './staff.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(staffServices.list, action.payload);
    yield put(fetchStaffListSuccess(data));
  } catch (error: any) {
    yield put(fetchStaffListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(staffServices.getOne, action.payload);
    yield put(fetchStaffOneSuccess(data));
  } catch (error: any) {
    yield put(fetchStaffOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(staffServices.save, action.payload);
    yield put(saveStaffSuccess(data));
  } catch (error: any) {
    yield put(saveStaffFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(staffServices.remove, action.payload);
    yield put(deleteStaffSuccess(data));
  } catch (error: any) {
    yield put(deleteStaffFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* staffSaga() {
  yield takeLatest(StaffActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(StaffActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(StaffActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(StaffActionTypes.DELETE_REQUEST, deleteItem);
}
