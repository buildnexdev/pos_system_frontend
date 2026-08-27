import { all } from 'redux-saga/effects';
import authSaga from './auth/auth.saga.tsx';
import branchMasterSaga from './branch/branch.saga.tsx';

export default function* rootSaga() {
  yield all([
    authSaga(),
    branchMasterSaga(),
  ]);
}
