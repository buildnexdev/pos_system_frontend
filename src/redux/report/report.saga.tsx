/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: report redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { ReportActionTypes } from './report.types';
import { reportServices } from './report.services';
import {
  deleteReportFailure,
  deleteReportSuccess,
  fetchReportListFailure,
  fetchReportListSuccess,
  fetchReportOneFailure,
  fetchReportOneSuccess,
  saveReportFailure,
  saveReportSuccess,
} from './report.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(reportServices.list, action.payload);
    yield put(fetchReportListSuccess(data));
  } catch (error: any) {
    yield put(fetchReportListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(reportServices.getOne, action.payload);
    yield put(fetchReportOneSuccess(data));
  } catch (error: any) {
    yield put(fetchReportOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(reportServices.save, action.payload);
    yield put(saveReportSuccess(data));
  } catch (error: any) {
    yield put(saveReportFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(reportServices.remove, action.payload);
    yield put(deleteReportSuccess(data));
  } catch (error: any) {
    yield put(deleteReportFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* reportSaga() {
  yield takeLatest(ReportActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(ReportActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(ReportActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(ReportActionTypes.DELETE_REQUEST, deleteItem);
}
