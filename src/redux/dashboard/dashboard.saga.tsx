/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: dashboard redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { DashboardActionTypes } from './dashboard.types';
import { dashboardServices } from './dashboard.services';
import {
  deleteDashboardFailure,
  deleteDashboardSuccess,
  fetchDashboardListFailure,
  fetchDashboardListSuccess,
  fetchDashboardOneFailure,
  fetchDashboardOneSuccess,
  saveDashboardFailure,
  saveDashboardSuccess,
} from './dashboard.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(dashboardServices.list, action.payload);
    yield put(fetchDashboardListSuccess(data));
  } catch (error: any) {
    yield put(fetchDashboardListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(dashboardServices.getOne, action.payload);
    yield put(fetchDashboardOneSuccess(data));
  } catch (error: any) {
    yield put(fetchDashboardOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(dashboardServices.save, action.payload);
    yield put(saveDashboardSuccess(data));
  } catch (error: any) {
    yield put(saveDashboardFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(dashboardServices.remove, action.payload);
    yield put(deleteDashboardSuccess(data));
  } catch (error: any) {
    yield put(deleteDashboardFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* dashboardSaga() {
  yield takeLatest(DashboardActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(DashboardActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(DashboardActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(DashboardActionTypes.DELETE_REQUEST, deleteItem);
}
