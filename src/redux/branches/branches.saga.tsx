/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: branches redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { BranchesActionTypes } from './branches.types';
import { branchesServices } from './branches.services';
import {
  deleteBranchesFailure,
  deleteBranchesSuccess,
  fetchBranchesListFailure,
  fetchBranchesListSuccess,
  fetchBranchesOneFailure,
  fetchBranchesOneSuccess,
  saveBranchesFailure,
  saveBranchesSuccess,
} from './branches.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(branchesServices.list, action.payload);
    yield put(fetchBranchesListSuccess(data));
  } catch (error: any) {
    yield put(fetchBranchesListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(branchesServices.getOne, action.payload);
    yield put(fetchBranchesOneSuccess(data));
  } catch (error: any) {
    yield put(fetchBranchesOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(branchesServices.save, action.payload);
    yield put(saveBranchesSuccess(data));
  } catch (error: any) {
    yield put(saveBranchesFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(branchesServices.remove, action.payload);
    yield put(deleteBranchesSuccess(data));
  } catch (error: any) {
    yield put(deleteBranchesFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* branchesSaga() {
  yield takeLatest(BranchesActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(BranchesActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(BranchesActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(BranchesActionTypes.DELETE_REQUEST, deleteItem);
}
