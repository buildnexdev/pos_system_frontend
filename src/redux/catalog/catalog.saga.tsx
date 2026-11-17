/**
 * Author: Nandhakumar
 * Version: 0.0.1
 * Desc: catalog redux sagas
 * Edit Date: 2026-11-12
 */

import { call, put, takeLatest } from 'redux-saga/effects';
import { CatalogActionTypes } from './catalog.types';
import { catalogServices } from './catalog.services';
import {
  deleteCatalogFailure,
  deleteCatalogSuccess,
  fetchCatalogListFailure,
  fetchCatalogListSuccess,
  fetchCatalogOneFailure,
  fetchCatalogOneSuccess,
  saveCatalogFailure,
  saveCatalogSuccess,
} from './catalog.action';

function* fetchList(action: any): Generator {
  try {
    const data: any = yield call(catalogServices.list, action.payload);
    yield put(fetchCatalogListSuccess(data));
  } catch (error: any) {
    yield put(fetchCatalogListFailure(error.response?.data?.message || error.message || 'Failed to load'));
  }
}

function* fetchOne(action: any): Generator {
  try {
    const data: any = yield call(catalogServices.getOne, action.payload);
    yield put(fetchCatalogOneSuccess(data));
  } catch (error: any) {
    yield put(fetchCatalogOneFailure(error.response?.data?.message || error.message || 'Failed to load item'));
  }
}

function* saveItem(action: any): Generator {
  try {
    const data: any = yield call(catalogServices.save, action.payload);
    yield put(saveCatalogSuccess(data));
  } catch (error: any) {
    yield put(saveCatalogFailure(error.response?.data?.message || error.message || 'Failed to save'));
  }
}

function* deleteItem(action: any): Generator {
  try {
    const data: any = yield call(catalogServices.remove, action.payload);
    yield put(deleteCatalogSuccess(data));
  } catch (error: any) {
    yield put(deleteCatalogFailure(error.response?.data?.message || error.message || 'Failed to delete'));
  }
}

export default function* catalogSaga() {
  yield takeLatest(CatalogActionTypes.FETCH_LIST_REQUEST, fetchList);
  yield takeLatest(CatalogActionTypes.FETCH_ONE_REQUEST, fetchOne);
  yield takeLatest(CatalogActionTypes.SAVE_REQUEST, saveItem);
  yield takeLatest(CatalogActionTypes.DELETE_REQUEST, deleteItem);
}
