/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: company redux sagas
 * Edit Date: 2026-11-14
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { CompanyActionTypes } from './company.types';
import { companyServices } from './company.services';
import {
  deleteCompanyFailure,
  deleteCompanySuccess,
  fetchCompanyListFailure,
  fetchCompanyListSuccess,
  fetchCompanyOneFailure,
  fetchCompanyOneSuccess,
  saveCompanyFailure,
  saveCompanySuccess,
} from './company.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(companyServices.list, action.payload);
    yield put(fetchCompanyListSuccess(data));
  } catch (error: any) {
    yield put(fetchCompanyListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(companyServices.getOne, action.payload);
    yield put(fetchCompanyOneSuccess(data));
  } catch (error: any) {
    yield put(fetchCompanyOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(companyServices.save, action.payload);
    yield put(saveCompanySuccess(data));
  } catch (error: any) {
    yield put(saveCompanyFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(companyServices.remove, action.payload);
    yield put(deleteCompanySuccess(data));
  } catch (error: any) {
    yield put(deleteCompanyFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* companySaga() {
  yield takeLatest(CompanyActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(CompanyActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(CompanyActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(CompanyActionTypes.DELETE_REQUEST, deleteItem);
}
